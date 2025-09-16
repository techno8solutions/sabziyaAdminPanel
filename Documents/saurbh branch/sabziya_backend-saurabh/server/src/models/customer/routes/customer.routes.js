import express from "express";
import {
  changePassword,
  getProfile,
  loginCustomer,
  refreshToken,
  registerCustomer,
  updateProfile,
} from "../controllers/customer.controller.js";
import authenticateToken from "../../../middlewares/customer.auth.middleware.js";

const router = express.Router();

// Local registration
router.post("/register", registerCustomer);
router.post("/login", loginCustomer);
router.post("/refresh-token", refreshToken);

router.get("/profile", authenticateToken, getProfile);
router.put("/profile", authenticateToken, updateProfile);
router.put("/change-password", authenticateToken, changePassword);

export default router;
