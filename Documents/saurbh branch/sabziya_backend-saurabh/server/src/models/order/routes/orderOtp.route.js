import express from 'express'
import { getGenerateOTP, resendOTP, verifyOTP } from '../controllers/orderOtp.controller.js';

const otpRouter = express.Router();


otpRouter.post("/generate", getGenerateOTP);
otpRouter.post("/verify", verifyOTP);
otpRouter.post("/resend", resendOTP);

export default otpRouter;