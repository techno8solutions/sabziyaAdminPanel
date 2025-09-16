import db from "../../index.js";
import { createDeliveryCompletedNotification } from "./notificationController.js";

const {
  OrderAssignment,
  Orders,
  OrderTracking,
  Customer,
  Notification,
  delivery_partners,
} = db;

export const getAssignedOrders = async (req, res) => {
  try {
    const assignments = await OrderAssignment.findAll({
      where: { delivery_partner_id: 7 }, // later replace with decoded.partnerId
      include: [
        {
          model: Orders,
          as: "order",
          include: [
            {
              model: Customer,
              as: "customer",
              attributes: ["id", "name", "phone_number", "email"],
            },
          ],
        },
        {
          model: OrderTracking,
          as: "trackingUpdates", // ✅ alias must match your association
          required: false,
          separate: true, // ⚡ ensures order + limit works in MySQL
          order: [["created_at", "DESC"]],
          limit: 1,
        },
      ],
      order: [["assigned_at", "DESC"]],
    });

    // Format data for frontend
    const formattedOrders = assignments.map((assignment) => {
      const order = assignment.order;
      const latestTracking = assignment.trackingUpdates?.[0] || null;

      return {
        id: order.id,
        status: latestTracking ? latestTracking.status : "order_placed", // ✅ pick status safely
        items: order.items ? order.items.split(",") : [],
        pickupLocation: "Shop Warehouse",
        deliveryAddress: order.delivery_address,
        contactName: order.customer?.name || "Unknown",
        contactPhone: order.customer?.phone_number || "", // ✅ fixed column
        deliveryCoords: {
          latitude: order.delivery_lat || 19.076,
          longitude: order.delivery_long || 72.8777,
        },
        distance: "2.5 km",
        eta: "15 min",
        tracking: latestTracking,
      };
    });

    return res.status(200).json({
      success: true,
      data: formattedOrders,
    });
  } catch (error) {
    console.error("Error fetching assigned orders:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
export const updateOrderStatus = async (req, res) => {
  try {
    const { order_id, status, coordinates, notes } = req.body;
    const delivery_partner_id = req.user.id;

    // Validate input
    if (!order_id || !status) {
      return res.status(400).json({
        success: false,
        message: "Order ID and status are required",
      });
    }

    // Find order
    const order = await Orders.findByPk(order_id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const orderTracking = await OrderTracking.findOne({
      where: { order_id },
      order: [["created_at", "DESC"]],
    });

    // Check if OTP verification is required
    let requiresOTP = false;
    let otpPurpose = "";

    if (status === "picked" && order.status === "pending") {
      requiresOTP = true;
      otpPurpose = "partner_verification";
    } else if (status === "delivered" && order.status === "out_for_delivery") {
      requiresOTP = true;
      otpPurpose = "customer_verification";
    }

    if (requiresOTP) {
      const verifiedOTP = await OrderOTP.findOne({
        where: {
          order_id,
          purpose: otpPurpose,
          is_verified: true,
        },
      });

      if (!verifiedOTP) {
        return res.status(400).json({
          success: false,
          message: "OTP verification required for this status change",
          requires_otp: true,
          otp_purpose: otpPurpose,
        });
      }
    }

    // Update order status
    const updatedOrder = await order.update({
      status: status === "picked" ? "out_for_delivery" : status,
      delivery_partner_id,
      coordinates: coordinates || order.coordinates,
      notes: notes || order.notes,
      ...(status === "delivered" && { delivered_at: new Date() }),
      ...(status === "picked" && { picked_at: new Date() }),
    });

    await orderTracking.update({
      status: status === "picked" ? "out_for_delivery" : status,
    });

    // ✅ Update delivery partner availability when picked
    if (status === "picked") {
      await delivery_partners.update(
        { availability_status: "on_delivery", is_active: true },
        { where: { id: delivery_partner_id } }
      );
    }

    // Send notifications based on status change
    if (status === "out_for_delivery") {
      await Notification.create({
        delivery_partner_id,
        type: "system_alert",
        title: "Delivery Started",
        message: `You have started delivery for order #${order_id}`,
        data: { order_id },
        priority: "medium",
      });

      try {
        await sendEmail(
          order.customer_phone,
          `Your order #${order_id} is out for delivery. Expected delivery time: ${updatedOrder.eta}`
        );
      } catch (smsError) {
        console.error("SMS notification failed:", smsError);
      }
    } else if (status === "delivered") {
      // ✅ Free partner after delivery
      await delivery_partners.update(
        { availability_status: "online", is_active: true },
        { where: { id: delivery_partner_id } }
      );

      await createDeliveryCompletedNotification(delivery_partner_id, order_id);
    }

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error.message,
    });
  }
};
