import express from "express";
import { makePayment } from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/customers/:customer_id/make-payment", makePayment);

export default router;
