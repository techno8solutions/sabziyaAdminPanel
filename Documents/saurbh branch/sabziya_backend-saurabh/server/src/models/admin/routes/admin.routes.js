import express from "express";
import {
  adminLoginSchema,
  adminSignupSchema,
} from "../../../validations/validation.js";
import { adminLogin, adminSignup } from "../controllers/admin.controller.js";
import { validate } from "../../../middlewares/validate.js";

const authRoutes = express.Router();

authRoutes.post("/signup", validate(adminSignupSchema), adminSignup);
authRoutes.post("/login", validate(adminLoginSchema), adminLogin);



export default authRoutes;
