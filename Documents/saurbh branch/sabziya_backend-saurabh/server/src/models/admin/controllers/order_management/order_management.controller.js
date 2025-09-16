// import OrderService from "../../../../services/admin/order_management/order.service.js";
// import { validationResult } from "express-validator";
// import ApiResponse from "../../../../utils/ApiResponse.js";
// import AsyncHandler from "../../../../utils/AsyncHandler.js";

// class OrderController {
//   /**
//    * Get all orders with filtering and pagination
//    * GET /api/admin/orders
//    */
//   getAllOrders = AsyncHandler(async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res
//         .status(400)
//         .json(new ApiResponse(400, null, "Validation failed", errors.array()));
//     }

//     console.log("Fetching all orders with filters and pagination ",req.query);

//     const {
//       status = "all",
//       dateFrom,
//       dateTo,
//       deliveryPartnerId,
//       customerId,
//       zone,
//       paymentStatus,
//       page = 1,
//       limit = 10,
//       sortBy = "created_at",
//       sortOrder = "DESC",
//     } = req.query;

//     const filters = {
//       status,
//       dateFrom,
//       dateTo,
//       deliveryPartnerId,
//       customerId,
//       zone,
//       paymentStatus,
//     };

//     const pagination = {
//       page: parseInt(page),
//       limit: parseInt(limit),
//       sortBy,
//       sortOrder,
//     };

//     const result = await OrderService.getAllOrders(filters, pagination);

//     res
//       .status(200)
//       .json(new ApiResponse(200, result, "Orders retrieved successfully"));
//   });

//   /**
//    * Get orders grouped by status with counts
//    * GET /api/admin/orders/status-summary
//    */
//   getOrderStatusSummary = AsyncHandler(async (req, res) => {
//     const statusSummary = await OrderService.getOrdersByStatus();

//     res
//       .status(200)
//       .json(
//         new ApiResponse(
//           200,
//           statusSummary,
//           "Order status summary retrieved successfully"
//         )
//       );
//   });

//   /**
//    * Get single order details
//    * GET /api/admin/orders/:orderId
//    */
//   getOrderById = AsyncHandler(async (req, res) => {
//     const { orderId } = req.params;

//     if (!orderId) {
//       return res
//         .status(400)
//         .json(new ApiResponse(400, null, "Order ID is required"));
//     }

//     try {
//       const order = await OrderService.getOrderById(orderId);

//       res
//         .status(200)
//         .json(
//           new ApiResponse(200, order, "Order details retrieved successfully")
//         );
//     } catch (error) {
//       if (error.message === "Order not found") {
//         return res
//           .status(404)
//           .json(new ApiResponse(404, null, "Order not found"));
//       }
//       throw error;
//     }
//   });

//   /**
//    * Manually assign order to delivery partner
//    * POST /api/admin/orders/:orderId/assign
//    */
//   assignOrderToPartner = AsyncHandler(async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res
//         .status(400)
//         .json(new ApiResponse(400, null, "Validation failed", errors.array()));
//     }

//     const { orderId } = req.params;
//     const { deliveryPartnerId, notes } = req.body;
//     const assignedBy = req.admin?.id; // Assuming admin is authenticated

//     try {
//       const order = await OrderService.assignOrderToPartner(
//         orderId,
//         deliveryPartnerId,
//         assignedBy
//       );

//       res
//         .status(200)
//         .json(
//           new ApiResponse(
//             200,
//             order,
//             "Order assigned to delivery partner successfully"
//           )
//         );
//     } catch (error) {
//       if (
//         error.message.includes("not found") ||
//         error.message.includes("not available") ||
//         error.message.includes("not in a assignable status") ||
//         error.message.includes("already assigned")
//       ) {
//         return res.status(400).json(new ApiResponse(400, null, error.message));
//       }
//       throw error;
//     }
//   });

//   /**
//    * Unassign order from delivery partner
//    * POST /api/admin/orders/:orderId/unassign
//    */
//   unassignOrderFromPartner = AsyncHandler(async (req, res) => {
//     const { orderId } = req.params;
//     const { reason } = req.body;

//     try {
//       const order = await OrderService.unassignOrderFromPartner(
//         orderId,
//         reason
//       );

//       res
//         .status(200)
//         .json(
//           new ApiResponse(
//             200,
//             order,
//             "Order unassigned from delivery partner successfully"
//           )
//         );
//     } catch (error) {
//       if (error.message === "No active assignment found for this order") {
//         return res.status(400).json(new ApiResponse(400, null, error.message));
//       }
//       throw error;
//     }
//   });

//   /**
//    * Update order status manually
//    * PUT /api/admin/orders/:orderId/status
//    */
//   updateOrderStatus = AsyncHandler(async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res
//         .status(400)
//         .json(new ApiResponse(400, null, "Validation failed", errors.array()));
//     }

//     const { orderId } = req.params;
//     const { status, notes } = req.body;
//     const updatedBy = req.admin?.id;

//     try {
//       const order = await OrderService.updateOrderStatus(
//         orderId,
//         status,
//         notes,
//         updatedBy
//       );

//       res
//         .status(200)
//         .json(new ApiResponse(200, order, "Order status updated successfully"));
//     } catch (error) {
//       if (error.message === "Order not found") {
//         return res
//           .status(404)
//           .json(new ApiResponse(404, null, "Order not found"));
//       }
//       throw error;
//     }
//   });

//   /**
//    * Cancel order
//    * POST /api/admin/orders/:orderId/cancel
//    */
//   cancelOrder = AsyncHandler(async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res
//         .status(400)
//         .json(new ApiResponse(400, null, "Validation failed", errors.array()));
//     }

//     const { orderId } = req.params;
//     const { reason, refundAmount } = req.body;

//     try {
//       const order = await OrderService.cancelOrder(
//         orderId,
//         reason,
//         refundAmount
//       );

//       res
//         .status(200)
//         .json(new ApiResponse(200, order, "Order cancelled successfully"));
//     } catch (error) {
//       if (
//         error.message === "Order not found" ||
//         error.message === "Cannot cancel a delivered order"
//       ) {
//         return res.status(400).json(new ApiResponse(400, null, error.message));
//       }
//       throw error;
//     }
//   });

//   /**
//    * Process order refund
//    * POST /api/admin/orders/:orderId/refund
//    */
//   processRefund = AsyncHandler(async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res
//         .status(400)
//         .json(new ApiResponse(400, null, "Validation failed", errors.array()));
//     }

//     const { orderId } = req.params;
//     const { refundAmount, reason } = req.body;

//     try {
//       const order = await OrderService.processRefund(
//         orderId,
//         refundAmount,
//         reason
//       );

//       res
//         .status(200)
//         .json(new ApiResponse(200, order, "Refund processed successfully"));
//     } catch (error) {
//       if (error.message === "Order not found") {
//         return res
//           .status(404)
//           .json(new ApiResponse(404, null, "Order not found"));
//       }
//       throw error;
//     }
//   });

//   /**
//    * Get available delivery partners for assignment
//    * GET /api/admin/orders/available-partners
//    */
//   getAvailableDeliveryPartners = AsyncHandler(async (req, res) => {
//     const { zone } = req.query;

//     const partners = await OrderService.getAvailableDeliveryPartners(zone);

//     res
//       .status(200)
//       .json(
//         new ApiResponse(
//           200,
//           partners,
//           "Available delivery partners retrieved successfully"
//         )
//       );
//   });

//   /**
//    * Get order statistics
//    * GET /api/admin/orders/statistics
//    */
//   getOrderStatistics = AsyncHandler(async (req, res) => {
//     const { dateFrom, dateTo } = req.query;

//     const statistics = await OrderService.getOrderStatistics(dateFrom, dateTo);

//     res
//       .status(200)
//       .json(
//         new ApiResponse(
//           200,
//           statistics,
//           "Order statistics retrieved successfully"
//         )
//       );
//   });

//   /**
//    * Bulk update order status
//    * PUT /api/admin/orders/bulk-update-status
//    */
//   bulkUpdateOrderStatus = AsyncHandler(async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res
//         .status(400)
//         .json(new ApiResponse(400, null, "Validation failed", errors.array()));
//     }

//     const { orderIds, status, notes } = req.body;
//     const updatedBy = req.admin?.id;

//     if (!Array.isArray(orderIds) || orderIds.length === 0) {
//       return res
//         .status(400)
//         .json(new ApiResponse(400, null, "orderIds must be a non-empty array"));
//     }

//     try {
//       const results = await Promise.allSettled(
//         orderIds.map((orderId) =>
//           OrderService.updateOrderStatus(orderId, status, notes, updatedBy)
//         )
//       );

//       const successful = results.filter((r) => r.status === "fulfilled").length;
//       const failed = results.filter((r) => r.status === "rejected").length;

//       res.status(200).json(
//         new ApiResponse(
//           200,
//           {
//             successful,
//             failed,
//             total: orderIds.length,
//             results: results.map((result, index) => ({
//               orderId: orderIds[index],
//               status: result.status,
//               error:
//                 result.status === "rejected" ? result.reason.message : null,
//             })),
//           },
//           `Bulk update completed. ${successful} successful, ${failed} failed.`
//         )
//       );
//     } catch (error) {
//       throw error;
//     }
//   });

//   /**
//    * Get order tracking history
//    * GET /api/admin/orders/:orderId/tracking
//    */
//   getOrderTracking = AsyncHandler(async (req, res) => {
//     const { orderId } = req.params;

//     try {
//       const order = await OrderService.getOrderById(orderId);

//       res.status(200).json(
//         new ApiResponse(
//           200,
//           {
//             orderId: order.id,
//             currentStatus: order.status,
//             tracking: order.tracking,
//           },
//           "Order tracking retrieved successfully"
//         )
//       );
//     } catch (error) {
//       if (error.message === "Order not found") {
//         return res
//           .status(404)
//           .json(new ApiResponse(404, null, "Order not found"));
//       }
//       throw error;
//     }
//   });
// }

// export default new OrderController();

import orderService from "../../../../services/admin/order_management/order.service.js";

export default {
  // ✅ List orders
  async getOrders(req, res) {
    try {
      const orders = await orderService.getAllOrders(req.query);
      res.json({ success: true, data: orders });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // ✅ Get order by ID
  async getOrder(req, res) {
    try {
      const order = await orderService.getOrderById(req.params.id);
      if (!order)
        return res.status(404).json({ success: false, message: "Not found" });
      res.json({ success: true, data: order });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // ✅ Assign partner
  async assignOrder(req, res) {
    try {
      const { orderId, partnerId } = req.body;
      
      if (!orderId || !partnerId) {
        res.json({
          success: false,
          message: "orderId and partnerId are required fields",
        });
        return;
      }
      const assignment = await orderService.assignOrder(orderId, partnerId);
      res.json({ success: true, data: assignment });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // ✅ Unassign partner
  async unassignOrder(req, res) {
    try {
      const { assignmentId } = req.body;
      const result = await orderService.unassignOrder(assignmentId);
      res.json({ success: true, data: result });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // ✅ Update status
  async updateStatus(req, res) {
    try {
      const { orderId, status } = req.body;
      const result = await orderService.updateOrderStatus(orderId, status);
      res.json({ success: true, data: result });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // ✅ Refund
  async refundOrder(req, res) {
    try {
      const { orderId } = req.body;
      const result = await orderService.processRefund(orderId);
      res.json({ success: true, data: result });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
};
