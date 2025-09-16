// server/src/models/customer/controllers/customer.controller.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import db from "../../index.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../../utils/generateToken.js";
const { Customer } = db;

// Register customer
export const registerCustomer = async (req, res) => {
  try {
    const { name, email, phone_number, password, address, city, postal_code } =
      req.body;

    // Check if customer already exists
    const existingCustomer = await Customer.findOne({
      where: {
        [Op.or]: [{ email }, { phone_number }],
      },
    });

    if (existingCustomer) {
      return res.status(400).json({
        status: 400,
        message: "Customer with this email or phone already exists",
      });
    }

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Create customer
    const customer = await Customer.create({
      name,
      email,
      phone_number,
      password_hash,
      address,
      city,
      postal_code,
    });

    // Generate tokens
    const accessToken = generateAccessToken({
      id: customer.id,
      email: customer.email,
    });
    const refreshToken = generateRefreshToken({
      id: customer.id,
      email: customer.email,
    });

    // Remove password from response
    const customerResponse = { ...customer.toJSON() };
    delete customerResponse.password_hash;

    res.status(201).json({
      status: 201,
      message: "Customer registered successfully",
      data: {
        customer: customerResponse,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: error.message || "Internal Server Error",
    });
  }
};

// Login customer
export const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find customer
    const customer = await Customer.findOne({ where: { email } });
    if (!customer) {
      return res.status(401).json({
        status: 401,
        message: "Invalid credentials",
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(
      password,
      customer.password_hash
    );
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 401,
        message: "Invalid credentials",
      });
    }

    // Check if customer is active
    if (customer.status !== "active") {
      return res.status(403).json({
        status: 403,
        message: "Account is not active",
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      id: customer.id,
      email: customer.email,
    });
    const refreshToken = generateRefreshToken({
      id: customer.id,
      email: customer.email,
    });

    // Remove password from response
    const customerResponse = { ...customer.toJSON() };
    delete customerResponse.password_hash;

    res.json({
      status: 200,
      message: "Login successful",
      data: {
        customer: customerResponse,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: error.message || "Internal Server Error",
    });
  }
};

// Get current customer profile
export const getProfile = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.user.id, {
      attributes: {
        exclude: ["password_hash", "deleted_at"],
      },
    });

    if (!customer) {
      return res.status(404).json({
        status: 404,
        message: "Customer not found",
      });
    }

    res.json({
      status: 200,
      message: "Profile retrieved successfully",
      data: { customer },
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: error.message || "Internal server error",
    });
  }
};

// Update customer profile
export const updateProfile = async (req, res) => {
  try {
    const {
      name,
      email,
      phone_number,
      address,
      city,
      postal_code,
      date_of_birth,
      gender,
    } = req.body;

    const customer = await Customer.findByPk(req.user.id);

    if (!customer) {
      return res.status(404).json({
        status: 404,
        message: "Customer not found",
      });
    }

    // Check if email already exists (excluding current user)
    if (email && email !== customer.email) {
      const existingEmail = await Customer.findOne({
        where: { email },
        paranoid: false,
      });

      if (existingEmail) {
        return res.status(400).json({
          status: 400,
          message: "Email already exists",
        });
      }
    }

    // Check if phone number already exists (excluding current user)
    if (phone_number && phone_number !== customer.phone_number) {
      const existingPhone = await Customer.findOne({
        where: { phone_number },
        paranoid: false,
      });

      if (existingPhone) {
        return res.status(400).json({
          status: 400,
          message: "Phone number already exists",
        });
      }
    }

    // Update fields
    const updatedFields = {
      ...(name && { name }),
      ...(email && { email }),
      ...(phone_number && { phone_number }),
      ...(address !== undefined && { address }),
      ...(city !== undefined && { city }),
      ...(postal_code !== undefined && { postal_code }),
      ...(date_of_birth !== undefined && { date_of_birth }),
      ...(gender !== undefined && { gender }),
    };

    await customer.update(updatedFields);

    // Fetch updated customer
    const updatedCustomer = await Customer.findByPk(req.user.id, {
      attributes: { exclude: ["password_hash", "deleted_at"] },
    });

    res.json({
      status: 200,
      message: "Profile updated successfully",
      data: { customer: updatedCustomer },
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: error.message || "Internal server error",
    });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: 400,
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        status: 400,
        message: "New password must be at least 6 characters",
      });
    }

    const customer = await Customer.findByPk(req.user.id);

    if (!customer) {
      return res.status(404).json({
        status: 404,
        message: "Customer not found",
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      customer.password_hash
    );
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 401,
        message: "Current password is incorrect",
      });
    }

    // Hash new password
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    await customer.update({ password_hash: newPasswordHash });

    res.json({
      status: 200,
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: error.message || "Internal server error",
    });
  }
};

// Refresh token
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        status: 401,
        message: "Refresh token required",
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const accessToken = generateAccessToken({
      id: decoded.id,
      email: decoded.email,
    });

    res.json({
      status: 200,
      message: "Token refreshed successfully",
      data: { accessToken },
    });
  } catch (error) {
    res.status(403).json({
      status: 403,
      message: "Invalid refresh token",
    });
  }
};
