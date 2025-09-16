export const otpVerificationTemplate = (name, otp) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2>Hello ${name},</h2>
    <p>Please use the OTP below to verify your account:</p>
    <div style="background: #f4f4f4; padding: 20px; text-align: center;">
      <h1 style="letter-spacing: 3px;">${otp}</h1>
    </div>
    <p>This OTP is valid for 15 minutes.</p>
    <p>Best regards,<br>Your Delivery Team</p>
  </div>
`;
