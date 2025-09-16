import express from 'express';
import { createOrderFromCart, getAllOrders, getOrderDetails } from '../controllers/order.controller.js';

const router = express.Router();

router.post("/customers/:customer_id/create-order", createOrderFromCart);

// 🔹 Fetch all orders (for admin)
router.get("/get-all-orders", getAllOrders);

// 🔹 Fetch all orders for a particular customer
router.get("/customer/:customer_id", getAllOrders);

// 🔹 Fetch order details for one particular order
router.get("/get-order-details/:order_id", getOrderDetails);

export default router;
