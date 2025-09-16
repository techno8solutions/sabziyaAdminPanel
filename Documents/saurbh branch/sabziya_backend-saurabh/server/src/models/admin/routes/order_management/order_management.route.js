import express from "express";
import adminOrderController from "../../controllers/order_management/order_management.controller.js";

const router = express.Router();

/* ---------------------- ROUTES ---------------------- */

/**
 * @route   GET /api/admin/orders
 */
router.get("/get-all-orders", adminOrderController.getOrders);

/**
 * @route   GET /api/admin/orders
 */

router.get("/:id", adminOrderController.getOrder);

/**
 * @route   PUT /api/admin/orders/:orderId/assign
 */

router.post("/assign", adminOrderController.assignOrder);

/**
 * @route   PUT /api/admin/orders/:orderId/unassign
 */

router.post("/unassign", adminOrderController.unassignOrder);

/**
 * @route   PUT /api/admin/orders/:orderId/status
 */
router.put("/status", adminOrderController.updateStatus);

/**
 * @route   POST /api/admin/orders/:orderId/refund
 */
router.post("/refund", adminOrderController.refundOrder);

export default router;
