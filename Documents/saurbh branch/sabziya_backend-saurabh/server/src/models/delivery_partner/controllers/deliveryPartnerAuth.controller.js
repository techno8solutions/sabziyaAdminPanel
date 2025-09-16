import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import { signJwt, verifyJwt } from "../../../utils/auth.js";
import { sendOtpEmail } from "../../../services/emailService.js";
import db from "../../index.js";
import { Op, Sequelize } from "sequelize";

const {
  delivery_partners,
  delivery_partners_registration,
  Otp_logs,
  Notification,
} = db;

// Helper function to generate OTP
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Signup - Step 1: Basic Info + OTP
export const signup = async (req, res) => {
  try {
    const { fullName, email, mobile, password, vehicleType } = req.body;

    // Check if user already exists
    const existingUser = await delivery_partners.findOne({ where: { email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "delivery_partners already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await delivery_partners.create({
      user_id: uuidv4(),
      name: fullName,
      email,
      phone: mobile,
      password: hashedPassword,
      role: "delivery_partner",
      is_verified: false,
    });
    // Create delivery partner record with basic info
    const partner = await delivery_partners_registration.create({
      id: uuidv4(),
      delivery_partner_id: user.id,
      partner_code: user.user_id,
      vehicle_type: vehicleType,
      verification_status: "pending",
    });

    // Generate and save OTP
    const otp = generateOtp();
    await Otp_logs.create({
      id: uuidv4(),
      user_id: user.id,
      otp_code: otp,
      phone_number: mobile,
      email: email,
      type: "email_verification",
      expires_at: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    });
    const email_token = signJwt(
      { userId: user.id, partnerId: partner.id },
      { expiresIn: "15m" }
    );

    // Save email_token to user record
    await user.update({ email_verification_token: email_token });
    // Send OTP email
    await sendOtpEmail(email, otp, fullName);
    await Notification.create({
      delivery_partner_id: user.id,
      type: "system_alert",
      title: "Welcome to Delivery Partner App",
      message:
        "Your account has been created successfully. Please complete your registration.",
      priority: "medium",
    });
    res.status(201).json({
      success: true,
      message:
        "OTP sent to your email. Please verify to continue registration.",
      partner_id: user.id,
      temp_token: email_token,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error during signup" });
  }
};

// Verify OTP
export const verifyOtp = async (req, res) => {
  try {
    const { otp, user_id } = req.body;
    const tempToken = req.headers["authorization"]?.split(" ")[1];

    if (!tempToken || !user_id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Validate JWT token
    const decoded = verifyJwt(tempToken);
    if (!decoded.valid) {
      return res.status(401).json({
        message: decoded.expired ? "Token expired" : "Invalid token",
      });
    }

    const { userId: tokenUserId, partnerId } = decoded.decoded;

    // Optional: Ensure user_id from body matches token
    if (user_id !== tokenUserId) {
      return res.status(403).json({ message: "User ID mismatch" });
    }
    // Validate if user exists with given id and token
    const userData = await delivery_partners.findOne({
      where: { id: tokenUserId, email_verification_token: tempToken },
    });

    if (!userData) {
      return res
        .status(404)
        .json({ message: "User not found or token mismatch" });
    }

    // Find latest valid OTP
    const otpRecord = await Otp_logs.findOne({
      where: {
        user_id: tokenUserId,
        otp_code: otp,
        type: "email_verification",
        expires_at: { [Sequelize.Op.gt]: new Date() },
        used: false,
      },
      order: [["createdAt", "DESC"]],
    });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Update OTP as used
    await otpRecord.update({
      used: true,
      verified_at: new Date(),
      is_verified: true,
    });

    // Generate registration token (valid for 24 hours)
    const registrationToken = signJwt(
      { userId: tokenUserId, partnerId },
      { expiresIn: "24h" }
    );
    // Update user as verified
    await delivery_partners.update(
      { is_email_verified: true, login_token: registrationToken },
      { where: { id: tokenUserId } }
    );
    await Notification.create({
      delivery_partner_id: tokenUserId,
      type: "system_alert",
      title: "Email Verified",
      message:
        "Your email has been verified successfully. Please complete your registration.",
      priority: "medium",
    });
    return res.status(200).json({
      success: true,
      message: "OTP verified successfully. Please complete your registration.",
      user_id: user_id,
      registration_token: registrationToken,
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    return res
      .status(500)
      .json({ message: "Server error during OTP verification" });
  }
};

export const completeRegistration = async (req, res) => {
  try {
    console.log(req.body);
    const registrationToken = req.headers["authorization"]?.split(" ")[1];

    if (!registrationToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = verifyJwt(registrationToken);
    if (!decoded.valid) {
      return res.status(401).json({
        message: decoded.expired ? "Token expired" : "Invalid token",
      });
    }

    const { userId, partnerId } = decoded.decoded;
    const files = req.files;

    const filePaths = {
      residential_proof: files["residential_proof"]?.[0]?.path || null,
      profile_photo_url: files["profile_photo_url"]?.[0]?.path || null,
      license_photo_url: files["license_photo_url"]?.[0]?.path || null,
      vehicle_photo_url: files["vehicle_photo_url"]?.[0]?.path || null,
    };

    // Move files into partner-specific folder
    if (userId) {
      const finalPath = path.join("uploads", "deliveryPartner", userId);
      if (!fs.existsSync(finalPath))
        fs.mkdirSync(finalPath, { recursive: true });

      for (const [key, filePath] of Object.entries(filePaths)) {
        if (filePath) {
          const fileName = path.basename(filePath);
          const newPath = path.join(finalPath, fileName);
          fs.renameSync(filePath, newPath);
          filePaths[key] = newPath;
        }
      }
    }

    const {
      full_name,
      DOB,
      gender,
      phone_number,
      email,
      emergency_contact_name,
      emergency_contact_number,
      street_address,
      city,
      postal_code,
      government_id,
      vehicle_type,
      vehicle_number,
      license_number,
      license_expiry,
      insurance_number,
      insurance_expiry,
      visa_type,
      ni_number,
      student_visa,
      psw_visa,
      availability_schedule,
      verification_status,
      commission_rate,
      partner_code,
      account_holder_name,
      account_number,
      sort_code,
    } = req.body;

    // Update basic info
    await delivery_partners.update(
      {
        name: full_name,
        phone: phone_number,
        email,
      },
      { where: { id: userId } }
    );

    // Update extended info with all fields from the model
    await delivery_partners_registration.update(
      {
        full_name,
        DOB,
        gender,
        phone_number,
        email,
        emergency_contact_name,
        emergency_contact_number: parseInt(emergency_contact_number) || 0,
        street_address,
        city,
        postal_code,
        government_id,
        vehicle_type,
        vehicle_number,
        license_number,
        license_expiry,
        insurance_number,
        insurance_expiry,
        visa_type,
        ni_number: parseInt(ni_number) || 0,
        student_visa: student_visa === "true" || student_visa === true,
        psw_visa: psw_visa === "true" || psw_visa === true,
        residential_proof: filePaths.residential_proof,
        profile_photo_url: filePaths.profile_photo_url,
        license_photo_url: filePaths.license_photo_url,
        vehicle_photo_url: filePaths.vehicle_photo_url,
        partner_code,
        account_holder_name,
        account_number: parseInt(account_number) || 0,
        sort_code: parseInt(sort_code) || 0,
        onboarding_completed: true,
        availability_status: "offline",
        verification_status: verification_status || "pending",
        commission_rate: parseFloat(commission_rate) || 0.15, // Default to 0.15 as in model
        availability_schedule: availability_schedule,
      },
      { where: { id: partnerId } }
    );

    // Issue new token
    const user = await delivery_partners.findByPk(userId);
    const authToken = signJwt({ userId: user.id }, { expiresIn: "7d" });
    user.is_registered = true;
    user.save();
    await Notification.create({
      delivery_partner_id: userId,
      type: "system_alert",
      title: "Registration Complete",
      message: "Your registration is complete. Your account is under review.",
      priority: "high",
    });
    console.log(1);
    return res.status(200).json({
      success: true,
      message: "Registration completed. Your account is under review.",
      token: authToken,
      partner: {
        id: partnerId,
        status: "pending",
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // At least one of email or phone must be provided
    if (!email || !password) {
      return res.status(400).json({
        message: "Email or phone and password are required",
      });
    }

    const user = await delivery_partners.findOne({
      where: {
        [Op.or]: [
          { email: email },
          { phone: email }, // assuming 'mobile' is the DB column for phone
        ],
      },
    });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    console.log(user)
    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    // Check if user is a registered delivery partner
    const partner = await delivery_partners_registration.findOne({
      where: { delivery_partner_id: user.id },
    });
    console.log(partner);

    if (!partner) {
      return res.status(403).json({
        message: "Access denied. Not a delivery partner.",
      });
    }

    // Generate JWT
    const token = signJwt(
      { userId: user.id, partnerId: partner.id },
      { expiresIn: "7d" }
    );
    await user.update({ login_token: token });
    await Notification.create({
      delivery_partner_id: user.id,
      type: "system_alert",
      title: "Login Successful",
      message: "You have successfully logged into your account.",
      priority: "low",
    });

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        is_verified: user.is_verified,
        is_registered: user.is_registered,
        is_email_verified: user.is_email_verified,
      },
      partner: {
        id: partner.id,
        status: partner.verification_status,
        onboarding_completed: partner.onboarding_completed,
        partner_code: partner.partner_code,
        vehicle_type: partner.vehicle_type,
        vehicle_number: partner.vehicle_number,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error during login" });
  }
};

// Get delivery partner profile
export const getProfile = async (req, res) => {
  try {
    const { userId } = req;

    const user = await delivery_partners.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const partner = await delivery_partners_registration.findOne({
      where: { delivery_partners_id: userId },
    });

    if (!partner) {
      return res.status(404).json({ message: "Partner profile not found" });
    }

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          is_verified: user.is_verified,
          is_email_verified: user.is_email_verified,
          is_active: user.is_active,
          role: user.role,
          last_login: user.last_login,
          profile_picture: user.profile_picture,
          availability_status: user.availability_status,
          device_id: user.device_id,
          device_type: user.device_type,
          timezone: user.timezone,
          language: user.language,
          created_at: user.created_at,
          updated_at: user.updated_at,
        },
        partner: {
          id: partner.id,
          partner_code: partner.partner_code,
          vehicle_type: partner.vehicle_type,
          vehicle_number: partner.vehicle_number,
          license_number: partner.license_number,
          license_expiry: partner.license_expiry,
          insurance_number: partner.insurance_number,
          insurance_expiry: partner.insurance_expiry,
          DOB: partner.DOB,
          emergency_contact_name: partner.emergency_contact_name,
          emergency_contact_number: partner.emergency_contact_number,
          street_address: partner.street_address,
          city: partner.city,
          postal_code: partner.postal_code,
          government_id: partner.government_id,
          availability_status: partner.availability_status,
          verification_status: partner.verification_status,
          onboarding_completed: partner.onboarding_completed,
          total_deliveries: partner.total_deliveries,
          successful_deliveries: partner.successful_deliveries,
          rating_average: partner.rating_average,
          total_ratings: partner.total_ratings,
          commission_rate: partner.commission_rate,
          profile_photo_url: partner.profile_photo_url,
          license_photo_url: partner.license_photo_url,
          vehicle_photo_url: partner.vehicle_photo_url,
          visa_type: partner.visa_type,
          ni_number: partner.ni_number,
          availability_schedule: partner.availability_schedule,
          account_holder_name: partner.account_holder_name,
          account_number: partner.account_number,
          sort_code: partner.sort_code,
          residential_proof: partner.residential_proof,
          created_at: partner.created_at,
          updated_at: partner.updated_at,
        },
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({ message: "Server error fetching profile" });
  }
};

// Update delivery partner profile
export const updateProfile = async (req, res) => {
  try {
    const { userId } = req;
    const files = req.files;

    const filePaths = {
      residential_proof: files["residential_proof"]?.[0]?.path || null,
      profile_photo_url: files["profile_photo_url"]?.[0]?.path || null,
      license_photo_url: files["license_photo_url"]?.[0]?.path || null,
      vehicle_photo_url: files["vehicle_photo_url"]?.[0]?.path || null,
    };

    // Move files into partner-specific folder
    if (userId) {
      const finalPath = path.join("uploads", "deliveryPartner", userId);
      if (!fs.existsSync(finalPath))
        fs.mkdirSync(finalPath, { recursive: true });

      for (const [key, filePath] of Object.entries(filePaths)) {
        if (filePath) {
          const fileName = path.basename(filePath);
          const newPath = path.join(finalPath, fileName);
          fs.renameSync(filePath, newPath);
          filePaths[key] = newPath;
        }
      }
    }

    const {
      name,
      phone,
      emergency_contact_name,
      emergency_contact_number,
      street_address,
      city,
      postal_code,
      vehicle_type,
      vehicle_number,
      license_number,
      license_expiry,
      insurance_number,
      insurance_expiry,
      availability_schedule,
      account_holder_name,
      account_number,
      sort_code,
    } = req.body;

    // Update basic user info
    if (name || phone) {
      await delivery_partners.update(
        {
          ...(name && { name }),
          ...(phone && { phone }),
        },
        { where: { id: userId } }
      );
    }

    // Update partner info
    const updateData = {
      ...(emergency_contact_name && { emergency_contact_name }),
      ...(emergency_contact_number && {
        emergency_contact_number: parseInt(emergency_contact_number) || 0,
      }),
      ...(street_address && { street_address }),
      ...(city && { city }),
      ...(postal_code && { postal_code }),
      ...(vehicle_type && { vehicle_type }),
      ...(vehicle_number && { vehicle_number }),
      ...(license_number && { license_number }),
      ...(license_expiry && { license_expiry }),
      ...(insurance_number && { insurance_number }),
      ...(insurance_expiry && { insurance_expiry }),
      ...(availability_schedule && {
        availability_schedule: JSON.parse(availability_schedule),
      }),
      ...(account_holder_name && { account_holder_name }),
      ...(account_number && {
        account_number: parseInt(account_number) || 0,
      }),
      ...(sort_code && {
        sort_code: parseInt(sort_code) || 0,
      }),
      ...(filePaths.residential_proof && {
        residential_proof: filePaths.residential_proof,
      }),
      ...(filePaths.profile_photo_url && {
        profile_photo_url: filePaths.profile_photo_url,
      }),
      ...(filePaths.license_photo_url && {
        license_photo_url: filePaths.license_photo_url,
      }),
      ...(filePaths.vehicle_photo_url && {
        vehicle_photo_url: filePaths.vehicle_photo_url,
      }),
    };

    if (Object.keys(updateData).length > 0) {
      await delivery_partners_registration.update(updateData, {
        where: { delivery_partners_id: userId },
      });
    }

    await Notification.create({
      delivery_partner_id: userId,
      type: "system_alert",
      title: "Profile Updated",
      message: "Your profile has been updated successfully.",
      priority: "low",
    });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({ message: "Server error updating profile" });
  }
};
