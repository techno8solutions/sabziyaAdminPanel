import nodemailer from "nodemailer";
import config from "../config/development.js";

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure,
  auth: {
    user: config.email.user,
    pass: config.email.password,
  },
});
export const sendEmail = async (to, subject, text) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Email sending failed:", error);
    throw error;
  }
};
export const sendOtpEmail = async (email, otp, name) => {
  try {
    const mailOptions = {
      from: `"Your Delivery Service" <${config.email.from}>`,
      to: email,
      subject: "Your OTP for Delivery Partner Registration",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Hello ${name},</h2>
          <p>Thank you for registering as a delivery partner. Please use the following OTP to verify your email:</p>
          <div style="background: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="margin: 0; color: #333; letter-spacing: 3px;">${otp}</h1>
          </div>
          <p>This OTP is valid for 15 minutes. If you didn't request this, please ignore this email.</p>
          <p>Best regards,<br>Your Delivery Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw error;
  }
};
