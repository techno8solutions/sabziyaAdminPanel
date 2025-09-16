// import { Op } from "sequelize";
// import db from "../../../models/index.js";

// const {
//   Orders,
//   OrderAssignment,
//   OrderItem,
//   OrderTracking,
//   delivery_partners,
//   delivery_partners_registration,
//   PartnerEarning,
//   DeliveryPartnerLocation,
// } = db;

// class OrderService {
//   /**
//    * Get all orders with filtering and pagination
//    */
//   async getAllOrders(filters = {}, pagination = {}) {
//     const {
//       status,
//       dateFrom,
//       dateTo,
//       deliveryPartnerId,
//       customerId,
//       zone,
//       paymentStatus,
//     } = filters;

//     const {
//       page = 1,
//       limit = 10,
//       sortBy = "created_at",
//       sortOrder = "DESC",
//     } = pagination;

//     const whereClause = {};
//     const includeClause = [];

//     // Apply filters
//     if (status && status !== "all") {
//       whereClause.status = status;
//     }

//     if (customerId) {
//       whereClause.customer_id = customerId;
//     }

//     if (paymentStatus) {
//       whereClause.payment_status = paymentStatus;
//     }

//     // Date range filter
//     if (dateFrom || dateTo) {
//       whereClause.order_date = {};
//       if (dateFrom) {
//         whereClause.order_date[Op.gte] = new Date(dateFrom);
//       }
//       if (dateTo) {
//         whereClause.order_date[Op.lte] = new Date(dateTo);
//       }
//     }

//     // Include order assignment and delivery partner
//     includeClause.push({
//       model: OrderAssignment,
//       as: "assignments",
//       include: [
//         {
//           model: delivery_partners,
//           as: "deliveryPartner",
//           include: [
//             {
//               model: delivery_partners_registration,
//               as: "registration",
//             },
//           ],
//         },
//       ],
//       required: false,
//     });

//     // Include order items
//     includeClause.push({
//       model: OrderItem,
//       as: "items",
//       required: false,
//     });

//     // Include order tracking
//     includeClause.push({
//       model: OrderTracking,
//       as: "trackingHistory",
//       required: false,
//       order: [["created_at", "DESC"]],
//     });

//     // Filter by delivery partner if specified
//     if (deliveryPartnerId) {
//       includeClause[0].where = {
//         delivery_partners_id: deliveryPartnerId,
//       };
//       includeClause[0].required = true;
//     }

//     const offset = (page - 1) * limit;

//     const result = await Orders.findAndCountAll({
//       where: whereClause,
//       include: includeClause,
//       limit: parseInt(limit),
//       offset: parseInt(offset),
//       order: [[sortBy, sortOrder]],
//       distinct: true,
//     });

//     return {
//       orders: result.rows,
//       pagination: {
//         total: result.count,
//         page: parseInt(page),
//         limit: parseInt(limit),
//         totalPages: Math.ceil(result.count / limit),
//       },
//     };
//   }

//   /**
//    * Get orders by status with counts
//    */
//   async getOrdersByStatus() {
//     const statusCounts = await Orders.findAll({
//       attributes: [
//         "status",
//         [db.sequelize.fn("COUNT", db.sequelize.col("id")), "count"],
//       ],
//       group: ["status"],
//     });

//     const statusMap = {
//       pending: 0,
//       confirmed: 0,
//       preparing: 0,
//       ready_for_delivery: 0,
//       out_for_delivery: 0,
//       delivered: 0,
//       cancelled: 0,
//     };

//     statusCounts.forEach((item) => {
//       statusMap[item.status] = parseInt(item.dataValues.count);
//     });

//     return statusMap;
//   }

//   /**
//    * Get single order with full details
//    */
//   async getOrderById(orderId) {
//     const order = await Orders.findByPk(orderId, {
//       include: [
//         {
//           model: OrderAssignment,
//           as: "assignment",
//           include: [
//             {
//               model: delivery_partners,
//               as: "deliveryPartner",
//               include: [
//                 {
//                   model: delivery_partners_registration,
//                   as: "registration",
//                 },
//               ],
//             },
//           ],
//         },
//         {
//           model: OrderItem,
//           as: "items",
//         },
//         {
//           model: OrderTracking,
//           as: "tracking",
//           order: [["created_at", "DESC"]],
//         },
//       ],
//     });

//     if (!order) {
//       throw new Error("Order not found");
//     }

//     return order;
//   }

//   /**
//    * Assign order to delivery partner
//    */
//   async assignOrderToPartner(orderId, deliveryPartnerId, assignedBy = null) {
//     const transaction = await db.sequelize.transaction();

//     try {
//       // Check if order exists and is assignable
//       const order = await Orders.findByPk(orderId, { transaction });
//       if (!order) {
//         throw new Error("Order not found");
//       }

//       if (
//         !["confirmed", "preparing", "ready_for_delivery"].includes(order.status)
//       ) {
//         throw new Error("Order is not in a assignable status");
//       }

//       // Check if delivery partner exists and is available
//       const deliveryPartner = await delivery_partners.findByPk(
//         deliveryPartnerId,
//         {
//           include: [
//             {
//               model: delivery_partners_registration,
//               as: "registration",
//               where: {
//                 verification_status: "verified",
//                 availability_status: ["online", "available"],
//               },
//             },
//           ],
//           transaction,
//         }
//       );

//       if (!deliveryPartner) {
//         throw new Error("Delivery partner not found or not available");
//       }

//       // Check if there's already an active assignment
//       const existingAssignment = await OrderAssignment.findOne({
//         where: {
//           order_id: orderId,
//           status: { [Op.not]: ["cancelled", "rejected", "delivered"] },
//         },
//         transaction,
//       });

//       if (existingAssignment) {
//         throw new Error("Order is already assigned to a delivery partner");
//       }

//       // Create new assignment
//       const assignment = await OrderAssignment.create(
//         {
//           order_id: orderId,
//           delivery_partners_id: deliveryPartnerId,
//           status: "assigned",
//           assigned_at: new Date(),
//         },
//         { transaction }
//       );

//       // Update order status if needed
//       if (order.status === "confirmed") {
//         await order.update({ status: "ready_for_delivery" }, { transaction });
//       }

//       // Create tracking entry
//       await OrderTracking.create(
//         {
//           order_id: orderId,
//           assignment_id: assignment.id,
//           status: "partner_assigned",
//           notes: `Order assigned to partner ${deliveryPartner.name}`,
//         },
//         { transaction }
//       );

//       // Update partner availability
//       await delivery_partners_registration.update(
//         { availability_status: "busy" },
//         {
//           where: { delivery_partners_id: deliveryPartnerId },
//           transaction,
//         }
//       );

//       await transaction.commit();
//       return await this.getOrderById(orderId);
//     } catch (error) {
//       await transaction.rollback();
//       throw error;
//     }
//   }

//   /**
//    * Unassign order from delivery partner
//    */
//   async unassignOrderFromPartner(orderId, reason = null) {
//     const transaction = await db.sequelize.transaction();

//     try {
//       const assignment = await OrderAssignment.findOne({
//         where: {
//           order_id: orderId,
//           status: { [Op.not]: ["delivered", "cancelled"] },
//         },
//         include: [
//           {
//             model: delivery_partners,
//             as: "deliveryPartner",
//           },
//         ],
//         transaction,
//       });

//       if (!assignment) {
//         throw new Error("No active assignment found for this order");
//       }

//       // Update assignment status
//       await assignment.update(
//         {
//           status: "cancelled",
//           rejection_reason: reason || "Unassigned by admin",
//         },
//         { transaction }
//       );

//       // Update order status back to ready_for_delivery
//       await Orders.update(
//         { status: "ready_for_delivery" },
//         { where: { id: orderId }, transaction }
//       );

//       // Create tracking entry
//       await OrderTracking.create(
//         {
//           order_id: orderId,
//           assignment_id: assignment.id,
//           status: "ready_for_pickup",
//           notes: reason || "Order unassigned and ready for new assignment",
//         },
//         { transaction }
//       );

//       // Update partner availability back to online
//       await delivery_partners_registration.update(
//         { availability_status: "online" },
//         {
//           where: { delivery_partners_id: assignment.delivery_partners_id },
//           transaction,
//         }
//       );

//       await transaction.commit();
//       return await this.getOrderById(orderId);
//     } catch (error) {
//       await transaction.rollback();
//       throw error;
//     }
//   }

//   /**
//    * Update order status manually
//    */
//   async updateOrderStatus(orderId, newStatus, notes = null, updatedBy = null) {
//     const transaction = await db.sequelize.transaction();

//     try {
//       const order = await Orders.findByPk(orderId, { transaction });
//       if (!order) {
//         throw new Error("Order not found");
//       }

//       const oldStatus = order.status;
//       await order.update({ status: newStatus }, { transaction });

//       // Get assignment if exists
//       const assignment = await OrderAssignment.findOne({
//         where: {
//           order_id: orderId,
//           status: { [Op.not]: ["cancelled", "rejected"] },
//         },
//         transaction,
//       });

//       // Create tracking entry
//       await OrderTracking.create(
//         {
//           order_id: orderId,
//           assignment_id: assignment?.id || null,
//           status: newStatus,
//           notes:
//             notes ||
//             `Status updated from ${oldStatus} to ${newStatus} by admin`,
//         },
//         { transaction }
//       );

//       // Update assignment status if needed
//       if (assignment && newStatus === "delivered") {
//         await assignment.update(
//           {
//             status: "delivered",
//             delivered_at: new Date(),
//           },
//           { transaction }
//         );

//         // Update partner availability
//         await delivery_partners_registration.update(
//           { availability_status: "online" },
//           {
//             where: { delivery_partners_id: assignment.delivery_partners_id },
//             transaction,
//           }
//         );
//       }

//       await transaction.commit();
//       return await this.getOrderById(orderId);
//     } catch (error) {
//       await transaction.rollback();
//       throw error;
//     }
//   }

//   /**
//    * Process order cancellation
//    */

//   async cancelOrder(orderId, reason, refundAmount = null) {
//     const transaction = await db.sequelize.transaction();

//     try {
//       const order = await Orders.findByPk(orderId, {
//         include: [
//           {
//             model: OrderAssignment,
//             as: "assignment",
//             where: { status: { [Op.not]: ["delivered", "cancelled"] } },
//             required: false,
//           },
//         ],
//         transaction,
//       });

//       if (!order) {
//         throw new Error("Order not found");
//       }

//       if (order.status === "delivered") {
//         throw new Error("Cannot cancel a delivered order");
//       }

//       // Update order status
//       await order.update(
//         {
//           status: "cancelled",
//           discount_amount: refundAmount || order.total_amount,
//         },
//         { transaction }
//       );

//       // Cancel assignment if exists
//       if (order.assignment) {
//         await OrderAssignment.update(
//           {
//             status: "cancelled",
//             rejection_reason: reason,
//           },
//           {
//             where: { id: order.assignment.id },
//             transaction,
//           }
//         );

//         // Free up the delivery partner
//         await delivery_partners_registration.update(
//           { availability_status: "online" },
//           {
//             where: {
//               delivery_partners_id: order.assignment.delivery_partners_id,
//             },
//             transaction,
//           }
//         );
//       }

//       // Create tracking entry
//       await OrderTracking.create(
//         {
//           order_id: orderId,
//           assignment_id: order.assignment?.id || null,
//           status: "cancelled",
//           notes: `Order cancelled: ${reason}`,
//         },
//         { transaction }
//       );

//       await transaction.commit();
//       return await this.getOrderById(orderId);
//     } catch (error) {
//       await transaction.rollback();
//       throw error;
//     }
//   }

//   /**
//    * Process order refund
//    */
//   async processRefund(orderId, refundAmount, reason) {
//     const transaction = await db.sequelize.transaction();

//     try {
//       const order = await Orders.findByPk(orderId, { transaction });
//       if (!order) {
//         throw new Error("Order not found");
//       }

//       // Update order with refund information
//       await order.update(
//         {
//           payment_status: "refunded",
//           discount_amount: refundAmount,
//         },
//         { transaction }
//       );

//       // Create tracking entry for refund
//       await OrderTracking.create(
//         {
//           order_id: orderId,
//           status: order.status, // Keep current status
//           notes: `Refund processed: ${refundAmount} - Reason: ${reason}`,
//         },
//         { transaction }
//       );

//       await transaction.commit();
//       return await this.getOrderById(orderId);
//     } catch (error) {
//       await transaction.rollback();
//       throw error;
//     }
//   }

//   /**
//    * Get available delivery partners for assignment
//    */
//   async getAvailableDeliveryPartners(zone = null) {
//     const whereClause = {
//       verification_status: "verified",
//       availability_status: ["online", "available"],
//       onboarding_completed: true,
//     };

//     const partners = await delivery_partners.findAll({
//       include: [
//         {
//           model: delivery_partners_registration,
//           as: "registration",
//           where: whereClause,
//         },
//       ],
//       where: {
//         is_active: true,
//         is_verified: true,
//       },
//     });

//     return partners;
//   }

//   /**
//    * Get order statistics
//    */
//   async getOrderStatistics(dateFrom, dateTo) {
//     const whereClause = {};
//     if (dateFrom || dateTo) {
//       whereClause.order_date = {};
//       if (dateFrom) whereClause.order_date[Op.gte] = new Date(dateFrom);
//       if (dateTo) whereClause.order_date[Op.lte] = new Date(dateTo);
//     }

//     const stats = await Orders.findAll({
//       attributes: [
//         [db.sequelize.fn("COUNT", db.sequelize.col("id")), "total_orders"],
//         [
//           db.sequelize.fn("SUM", db.sequelize.col("total_amount")),
//           "total_revenue",
//         ],
//         [
//           db.sequelize.fn("AVG", db.sequelize.col("total_amount")),
//           "average_order_value",
//         ],
//         [
//           db.sequelize.fn(
//             "COUNT",
//             db.sequelize.literal("CASE WHEN status = 'delivered' THEN 1 END")
//           ),
//           "delivered_orders",
//         ],
//         [
//           db.sequelize.fn(
//             "COUNT",
//             db.sequelize.literal("CASE WHEN status = 'cancelled' THEN 1 END")
//           ),
//           "cancelled_orders",
//         ],
//       ],
//       where: whereClause,
//       raw: true,
//     });

//     return stats[0];
//   }
// }

// export default new OrderService();

import db from "../../../models/index.js";
const {
  Orders,
  OrderAssignment,
  OrderItems,
  Product,
  Payment,
  Customer,
  delivery_partners,
  delivery_partners_registration,
} = db;

export default {
  
  async getAllOrders({ status, dateFrom, dateTo, customerId, partnerId }) {
    const where = {};

    if (status) where.status = status;
    if (dateFrom && dateTo) {
      where.order_date = { [db.Sequelize.Op.between]: [dateFrom, dateTo] };
    }
    if (customerId) where.customer_id = customerId;

    const orders = await Orders.findAll({
      where,
      include: [
        {
          model: Customer,
          as: "customer",
          attributes: ["id", "name", "phone_number", "address"],
        },
        {
          model: OrderItems,
          as: "items",
          attributes: [
            "id",
            "product_id",
            "quantity",
            "unit_price",
            "total_price",
          ],
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "p_title"],
            },
          ],
        },
        {
          model: Payment,
          as: "payment",
          attributes: [
            "id",
            "payment_gateway",
            "transaction_id",
            "amount",
            "status",
            "paid_at",
          ],
        },
        {
          model: OrderAssignment,
          as: "assignments",
          include: [
            {
              model: delivery_partners_registration,
              as: "partnerRegistration",
              attributes: ["id", "rating_average", "total_ratings"],
              include: [
                {
                  model: delivery_partners,
                  as: "partnerAccount",
                  attributes: ["id", "name", "phone"],
                },
              ],
            },
          ],
        },
      ],
      order: [["order_date", "DESC"]],
    });

    // Transform into expected response
    return orders.map((order) => {
      const assignment = order.assignments?.[0]; // first assignment
      const partnerReg = assignment?.partnerRegistration || null;
      const partnerAcc = partnerReg?.partnerAccount || null;

      return {
        id: order.order_number, // e.g. "#ORD-001"
        customer: {
          name: order.customer?.name,
          phone: order.customer?.phone_number,
          address: order.customer?.address,
        },

        items: order.items?.map((item) => ({
          name: item.product?.p_title, // fixed here
          quantity: item.quantity,
          price: item.total_price, // already unit * qty
        })),

        total: order.items?.reduce(
          (sum, item) => sum + Number(item.total_price || 0),
          0
        ),
        deliveryCharge: order.delivery_charge,
        totalAmount: order.total_amount,

        orderStatus: order.status,
        assignmentStatus: assignment?.status || null,

        payment: order.payment
          ? {
              method: order.payment.payment_gateway,
              transactionId: order.payment.transaction_id,
              amount: order.payment.amount,
              status: order.payment.status,
              paidAt: order.payment.paid_at,
            }
          : null,

        orderTime: order.order_date,
        deliveryTime: order.delivery_time,

        deliveryPartner: partnerAcc
          ? {
              name: partnerAcc.name,
              phone: partnerAcc.phone,
              rating: partnerReg.rating_average,
            }
          : null,
      };
    });
  },

  // Get order by ID
  async getOrderById(orderId) {
    return Orders.findByPk(orderId, {
      include: [
        {
          model: Customer,
          as: "customer",
          attributes: ["id", "name", "phone_number"],
        },
        {
          model: OrderAssignment,
          as: "assignments",
          include: [
            {
              model: delivery_partners_registration,
              as: "partnerRegistration",
              attributes: ["id", "rating_average", "total_ratings"],
              include: [
                {
                  model: delivery_partners,
                  as: "partnerAccount",
                  attributes: ["id", "name", "phone"],
                },
              ],
            },
          ],
        },
      ],
    });
  },

  // Assign order to partner
  async assignOrder(orderId, partnerId) {
    return OrderAssignment.create({
      order_id: orderId,
      delivery_partner_id: partnerId, // ✅ fixed field
      status: "assigned",
    });
  },

  // Unassign order
  async unassignOrder(assignmentId) {
    const assignment = await OrderAssignment.findByPk(assignmentId);
    if (!assignment) throw new Error("Assignment not found");

    assignment.delivery_partner_id = null;
    assignment.status = "cancelled";
    return assignment.save();
  },

  // Update order status manually
  async updateOrderStatus(orderId, status) {
    const order = await Orders.findByPk(orderId);
    if (!order) throw new Error("Order not found");

    order.status = status;
    return order.save();
  },

  // Process refund (mark order + payment status)
  async processRefund(orderId) {
    const order = await Orders.findByPk(orderId);
    if (!order) throw new Error("Order not found");

    order.payment_status = "refunded";
    order.status = "cancelled";
    return order.save();
  },
};
