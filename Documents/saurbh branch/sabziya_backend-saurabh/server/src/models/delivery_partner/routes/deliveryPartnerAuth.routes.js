import express from "express";
import {
  signup,
  verifyOtp,
  completeRegistration,
  login,
} from "../controllers/deliveryPartnerAuth.controller.js";
import upload from "../../../config/multer.js";

const deliveryPartnerRouter = express.Router();

// Signup - Step 1
deliveryPartnerRouter.post("/signup", signup);

// Verify OTP
deliveryPartnerRouter.post("/verify-otp", verifyOtp);

// Registration - Step 2 (with file uploads)
deliveryPartnerRouter.post(
  "/register",
  upload.fields([
    { name: "government_id", maxCount: 1 },        // was governmentId
    { name: "residential_proof", maxCount: 1 },    // was addressProof
    { name: "profile_photo_url", maxCount: 1 },    // was selfie
    { name: "vehicle_photo_url", maxCount: 1 },    // was vehicleRegistration
    { name: "license_photo_url", maxCount: 1 },    // was drivingLicense
    // Add insurance if needed
  ]),
  completeRegistration
);
// Login
deliveryPartnerRouter.post("/login", login);

export default deliveryPartnerRouter;
