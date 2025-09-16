import { sendEmail } from "../../../services/emailService.js";
import { generateOTP } from "../../../utils/helper.js";
import { createDeliveryCompletedNotification } from "../../delivery_partner/controllers/notificationController.js";
import db from '../../index.js'

// const { sendEmail,  } = require("../utils/notificationService");
const { OrderOTP, Orders, OrderTracking } = db;
// Generate and send OTP
export const getGenerateOTP = async (req, res) => {
  try {
    const { order_id, purpose, phone_number } = req.body;

    // Validate input
    if (!order_id || !purpose || !phone_number) {
      return res.status(400).json({
        success: false,
        message: "Orders ID, purpose, and phone number are required",
      });
    }
console.log(order_id)
    // Check if order exists
    const order = await Orders.findByPk(order_id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Orders not found",
      });
    }

    // Generate OTP (6 digits)
    const otp_code = generateOTP(6);
    const expires_at = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

    // Create or update OTP record
    const [otpRecord, created] = await OrderOTP.upsert(
      {
        order_id,
        phone_number,
        otp_code,
        purpose,
        expires_at,
        is_verified: false,
        verified_at: null,
        attempts: 0,
      },
      {
        returning: true,
      }
    );

    // Determine recipient based on purpose
    let recipientInfo;
    let messageTemplate;

    switch (purpose) {
      case "partner_verification": // Store manager verification for pickup
        // const storeManager = await User.findOne({
        //   where: { role: "store_manager"},
        // });

        recipientInfo = {
          email:  "vaibhavvpatill@gmail.com",
          phone:  "12345678920",
        };

        messageTemplate = {
          email: {
            subject: "OTP for Orders Pickup Verification",
            body: `Your OTP for order #${order_id} pickup verification is: ${otp_code}. Valid for 15 minutes.`,
          },
          sms: `Your OTP for order #${order_id} pickup verification is: ${otp_code}. Valid for 15 minutes.`,
        };
        break;

      case "customer_verification": // Customer verification for delivery
        recipientInfo = {
          email: order.customer_email || "vaibhavvpatill@gmail.com",
          phone: order.customer_phone || "123456789",
        };

        messageTemplate = {
          email: {
            subject: "OTP for Orders Delivery Verification",
            body: `Your OTP for order #${order_id} delivery verification is: ${otp_code}. Valid for 15 minutes.`,
          },
          sms: `Your OTP for order #${order_id} delivery verification is: ${otp_code}. Valid for 15 minutes.`,
        };
        break;

      default:
        return res.status(400).json({
          success: false,
          message: "Invalid OTP purpose",
        });
    }

    // Send OTP via both email and SMS
    try {
      if (recipientInfo.email) {
        await sendEmail(
          recipientInfo.email,
          messageTemplate.email.subject,
          messageTemplate.email.body
        );
      }

    //   if (recipientInfo.phone) {
    //     await sendSMS(recipientInfo.phone, messageTemplate.sms);
    //   }
    } catch (notificationError) {
      console.error("Notification sending failed:", notificationError);
      // Continue even if notification fails - OTP is still stored
    }

    res.status(200).json({
      success: true,
      message: "OTP generated and sent successfully",
      data: {
        order_id,
        purpose,
        expires_at: otpRecord.expires_at,
      },
    });
  } catch (error) {
    console.error("Generate OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate OTP",
      error: error.message,
    });
  }
};

// Verify OTP
export const verifyOTP = async (req, res) => {
  try {
    const { order_id, otp_code, purpose } = req.body;

    // Validate input
    if (!order_id || !otp_code || !purpose) {
      return res.status(400).json({
        success: false,
        message: "Orders ID, OTP code, and purpose are required",
      });
    }

    // Find the latest OTP record
    const otpRecord = await OrderOTP.findOne({
      where: {
        order_id,
        purpose,
        is_verified: false,
      },
      order: [["created_at", "DESC"]],
    });

    if (!otpRecord) {
      return res.status(404).json({
        success: false,
        message: "No active OTP found for this order",
      });
    }

    // Check if OTP has expired
    if (new Date() > otpRecord.expires_at) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    // Check attempt limit
    if (otpRecord.attempts >= 5) {
      return res.status(429).json({
        success: false,
        message: "Too many failed attempts. Please request a new OTP.",
      });
    }

    // Verify OTP
    if (otpRecord.otp_code !== otp_code) {
      await otpRecord.increment("attempts");

      return res.status(400).json({
        success: false,
        message: "Invalid OTP code",
        attempts_remaining: 5 - (otpRecord.attempts + 1),
      });
    }

    // Mark OTP as verified
    otpRecord.is_verified = true;
    otpRecord.verified_at = new Date();
    await otpRecord.save();

    // Update order status based on OTP purpose
    let newStatus;
    let statusMessage;

    switch (purpose) {
      case "partner_verification":
        newStatus = "out_for_delivery";
        statusMessage = "Orders picked up successfully after OTP verification";

        // Create pickup notification
        await Notification.create({
          delivery_partner_id: req.user.id,
          type: "system_alert",
          title: "Order Picked Up",
          message: `Order #${order_id} has been picked up successfully`,
          data: { order_id },
          priority: "medium",
        });
        break;

      case "customer_verification":
        newStatus = "delivered";
        statusMessage = "Orders delivered successfully after OTP verification";

        // Create delivery completed notification
        await createDeliveryCompletedNotification(req.user.id, order_id);
        break;

      default:
        newStatus = null;
    }

    if (newStatus) {
      await Orders.update({ status: newStatus }, { where: { id: order_id } });
      await OrderTracking.update(
        { status: newStatus },
        { where: { order_id } }
      );
    }

    res.status(200).json({
      success: true,
      message: statusMessage || "OTP verified successfully",
      data: {
        order_id,
        purpose,
        verified_at: otpRecord.verified_at,
      },
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify OTP",
      error: error.message,
    });
  }
};


// Resend OTP
export const resendOTP = async (req, res) => {
  try {
    const { order_id, purpose, phone_number } = req.body;

    // Validate input
    if (!order_id || !purpose || !phone_number) {
      return res.status(400).json({
        success: false,
        message: "Orders ID, purpose, and phone number are required",
      });
    }

    // Invalidate previous OTPs for this order and purpose
    await OrderOTP.update(
      { is_verified: true }, // Mark as verified to prevent reuse
      {
        where: {
          order_id,
          purpose,
          is_verified: false,
        },
      }
    );

    // Generate new OTP by calling the generate function
    req.body = { order_id, purpose, phone_number };
    return exports.generateOTP(req, res);
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to resend OTP",
      error: error.message,
    });
  }
};

// Get OTP status
export const getOTPStatus = async (req, res) => {
  try {
    const { order_id, purpose } = req.params;

    const otpRecord = await OrderOTP.findOne({
      where: {
        order_id: parseInt(order_id),
        purpose,
      },
      order: [["created_at", "DESC"]],
      attributes: ["is_verified", "expires_at", "attempts", "created_at"],
    });

    if (!otpRecord) {
      return res.status(404).json({
        success: false,
        message: "No OTP record found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        is_verified: otpRecord.is_verified,
        is_expired: new Date() > otpRecord.expires_at,
        expires_at: otpRecord.expires_at,
        attempts: otpRecord.attempts,
        created_at: otpRecord.created_at,
      },
    });
  } catch (error) {
    console.error("Get OTP status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get OTP status",
      error: error.message,
    });
  }
};
