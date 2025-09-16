import db from "../../index.js"; // Sequelize init
const {
  delivery_partners,
  delivery_partners_registration,
  Orders,
  OrderAssignment,
  Notification
} = db;

// ✅ Get all delivery partners
export const getAllDeliveryPartners = async (req, res) => {
  try {
    const partners = await delivery_partners.findAll({
      include: [
        { model: delivery_partners_registration, as: "registration" }, // changed as: to registration from deliverypratner
      ],
      attributes: {
        exclude: [
          "password",
          "password_reset_token",
          "email_verification_token",
        ],
      },
    });
    res.status(200).json({ success: true, data: partners });
  } catch (error) {
    console.error("Error fetching partners:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get details of a specific delivery partner
export const getDeliveryPartnerById = async (req, res) => {
  try {
    console.log(2);
    const { id } = req.query;
    // const partner = await delivery_partners.findByPk(id, {

    const partner = await delivery_partners.findByPk(id);
    const partnerRegistration = await delivery_partners_registration.findOne({
      delivery_partner_id: id,
    });
    const data = {
      partner,
      partnerRegistration,
    };
    if (!partner) {
      return res
        .status(404)
        .json({ success: false, message: "Delivery partner not found" });
    }
    console.log(data);
    // Format the response to match frontend expectations
    const formattedResponse = {
      success: true,
      data,
    };

    res.status(200).json(formattedResponse);
  } catch (error) {
    console.error("Error fetching partner:", error);
    res.status(500).json({
      success: false,
      message: error.message,
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// ✅ Verify delivery partner
// ✅ Verify delivery partner with notification
export const verifyDeliveryPartner = async (req, res) => {
  try {
    const { id } = req.query;

    const partner = await delivery_partners.findByPk(id);
    if (!partner) {
      return res
        .status(404)
        .json({ success: false, message: "Delivery partner not found" });
    }

    partner.is_verified = true;
    partner.verification_status = "verified";
    await partner.save();

    // Create verification notification
    await Notification.create({
      delivery_partner_id: id,
      type: "system_alert",
      title: "Account Verified",
      message: "Congratulations! Your delivery partner account has been verified successfully.",
      priority: "high",
    });

    res.status(200).json({
      success: true,
      message: "Delivery partner verified successfully",
      data: partner,
    });
  } catch (error) {
    console.error("Error verifying partner:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
// ✅ Get orders needing assignment
export const getOrdersNeedingAssignment = async (req, res) => {
  try {
    const orders = await Orders.findAll({
      include: [{ model: OrderAssignment, as: "assignments" }],
    });

    // filter only those without assignment
    const unassignedOrders = orders.filter(
      (order) => !order.assignments || order.assignments.length === 0
    );

    return res.status(200).json({
      success: true,
      message: "Orders needing assignment fetched successfully",
      data: unassignedOrders,
    });
  } catch (error) {
    console.error("Error fetching unassigned orders:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ✅ Assign order to delivery partner
// Assign order to delivery partner with notification
export const assignOrderToPartner = async (req, res) => {
  try {
    const { orderId, partnerId } = req.body;

    if (!orderId || !partnerId) {
      return res.status(400).json({
        success: false,
        message: "Order ID and Delivery Partner ID are required",
      });
    }

    const order = await Orders.findByPk(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (order.status === "out_for_delivery") {
      return res.status(400).json({
        success: false,
        message: "Order is already out for delivery",
      });
    }

    const partner = await delivery_partners.findByPk(partnerId);
    if (!partner) {
      return res
        .status(404)
        .json({ success: false, message: "Delivery partner not found" });
    }

    const partnerRegistration = await delivery_partners_registration.findOne({
      where: { delivery_partner_id: partnerId },
    });
    if (!partnerRegistration) {
      return res.status(404).json({
        success: false,
        message: "Delivery partner registration not found",
      });
    }

    // ✅ Create assignment
    const assignment = await OrderAssignment.create({
      order_id: orderId,
      delivery_partner_id: partnerId,
      status: "assigned",
      assigned_at: new Date(),
    });

    // ✅ Update order status
    order.status = "out_for_delivery";
    await order.save();

    // ✅ Increment deliveries in main partner model
    partner.total_deliveries = (partner.total_deliveries || 0) + 1;
    partner.availability_status = "Order Assigned";
    await partner.save();

    // ✅ Create notification for delivery partner
    await Notification.create({
      delivery_partner_id: partnerId,
      type: "new_delivery",
      title: "New Delivery Assigned",
      message: `You have been assigned a new delivery order #${orderId}. Please check your assignments.`,
      data: {
        order_id: orderId,
        assignment_id: assignment.id,
        customer_address: order.delivery_address,
        estimated_earnings: order.total_amount * 0.15 // Example commission calculation
      },
      priority: "high",
    });

    return res.status(200).json({
      success: true,
      message: "Order assigned successfully",
      data: { order, assignment },
    });
  } catch (error) {
    console.error("Error assigning order:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
export const setOnline = async (req, res) => {
  try {
    console.log(234);
    const userId = req.query.id; // assuming middleware decodes token
    await delivery_partners.update(
      {
        is_active: true,
        availability_status: "online",
        last_login: new Date(),
      },
      { where: { id: userId } }
    );
    res.status(200).json({ success: true, message: "User is online" });
  } catch (error) {
    console.error("setOnline error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
// Mark user offline
export const setOffline = async (req, res) => {
  try {
    const userId = req.query.id;

    // Fetch the current status
    const partner = await delivery_partners.findOne({
      where: { id: userId },
      attributes: ["availability_status"],
    });

    if (!partner) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // If status is "order_assigned" or "on_delivery", don't update
    if (
      partner.availability_status === "order_assigned" ||
      partner.availability_status === "on_delivery"
    ) {
      return res.status(200).json({
        success: true,
        message: `User is in ${partner.availability_status}, status not changed`,
      });
    }

    // Otherwise, mark offline
    await delivery_partners.update(
      { is_active: false, availability_status: "offline" },
      { where: { id: userId } }
    );

    res.status(200).json({ success: true, message: "User is offline" });
  } catch (error) {
    console.error("setOffline error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Heartbeat (keep alive)
export const heartbeat = async (req, res) => {
  try {
    const userId = req.query.id;

    await delivery_partners.update(
      { is_active: true, last_login: new Date() },
      { where: { id: userId } }
    );

    res.status(200).json({ success: true, message: "Heartbeat updated" });
  } catch (error) {
    console.error("heartbeat error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
