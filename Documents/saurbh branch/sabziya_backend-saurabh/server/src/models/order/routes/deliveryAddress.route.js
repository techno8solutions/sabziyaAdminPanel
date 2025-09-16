import express from 'express';
import { addDeliveryAddress, deleteDeliveryAddress, updateDeliveryAddress, getCustomerAddresses } from "../controllers/deliveryAddress.controller.js";

const router = express.Router();

// POST /api/v1/customers/:customer_id/address
router.post("/customers/:customer_id/address", addDeliveryAddress);

// Delete a specific delivery address for a customer
router.delete("/customers/:customer_id/address/:address_id", deleteDeliveryAddress);

// Update a particular address for a customer
router.put("/customers/:customer_id/address/:address_id", updateDeliveryAddress);

// Get all addresses for a particular customer
router.get("/customers/:customer_id/addresses", getCustomerAddresses);

export default router;