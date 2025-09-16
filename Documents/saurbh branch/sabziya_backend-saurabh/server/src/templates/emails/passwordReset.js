export const passwordResetTemplate = (name, resetLink) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2>Hello ${name},</h2>
    <p>You requested a password reset. Click the link below to reset your password:</p>
    <a href="${resetLink}" style="background:#007bff;color:#fff;padding:10px 15px;text-decoration:none;border-radius:5px;">Reset Password</a>
    <p>If you didn’t request this, please ignore this email.</p>
    <p>Best regards,<br>Your Delivery Team</p>
  </div>
`;
