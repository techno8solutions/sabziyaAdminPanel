import db from "../../index.js";

const {
  Notification,
  OrderAssignment,
  PartnerPayment,
  Order,
  DeliveryPartner,
} = db;
// Get notifications for a delivery partner
export const getNotifications = async (req, res) => {
  try {
    const { partner_id } = req.query;
    const { page = 1, limit = 20, unread_only = false } = req.query;

    const offset = (page - 1) * limit;

    const whereClause = { delivery_partner_id: partner_id };
    if (unread_only === "true") {
      whereClause.is_read = false;
    }

    const { count, rows: notifications } = await Notification.findAndCountAll({
      where: whereClause,
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: offset,
    });

    res.status(200).json({
      success: true,
      data: notifications,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(count / limit),
        count: count,
      },
    });
  } catch (error) {
    console.error("getNotifications error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Mark notification as read
export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.query;

    const notification = await Notification.findByPk(id);
    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }

    await notification.update({ is_read: true });

    res
      .status(200)
      .json({ success: true, message: "Notification marked as read" });
  } catch (error) {
    console.error("markNotificationAsRead error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const { partner_id } = req.query;

    await Notification.update(
      { is_read: true },
      { where: { delivery_partner_id: partner_id, is_read: false } }
    );

    res
      .status(200)
      .json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    console.error("markAllNotificationsAsRead error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get unread notification count
export const getUnreadNotificationCount = async (req, res) => {
  try {
    const { partner_id } = req.query;

    const count = await Notification.count({
      where: { delivery_partner_id: partner_id, is_read: false },
    });

    res.status(200).json({ success: true, count });
  } catch (error) {
    console.error("getUnreadNotificationCount error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
// Get all notifications for delivery partner

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { notification_id } = req.query;
    const { delivery_partner_id } = req.body;

    const notification = await Notification.findOne({
      where: { id: notification_id, delivery_partner_id },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    notification.is_read = true;
    await notification.save();

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark notification as read",
      error: error.message,
    });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    const { delivery_partner_id } = req.body;

    await Notification.update(
      { is_read: true },
      { where: { delivery_partner_id, is_read: false } }
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Mark all as read error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark notifications as read",
      error: error.message,
    });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const { notification_id } = req.query;

    const notification = await Notification.findOne({
      where: { id: notification_id },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    await notification.destroy();

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Delete notification error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete notification",
      error: error.message,
    });
  }
};

// Get notification statistics
export const getNotificationStats = async (req, res) => {
  try {
    const { delivery_partner_id } = req.body;

    const totalCount = await Notification.count({
      where: { delivery_partner_id },
    });
    const unreadCount = await Notification.count({
      where: { delivery_partner_id, is_read: false },
    });

    // Count by type
    const typeCounts = await Notification.findAll({
      where: { delivery_partner_id },
      attributes: [
        "type",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["type"],
    });

    res.status(200).json({
      success: true,
      data: {
        total_count: totalCount,
        unread_count: unreadCount,
        type_counts: typeCounts,
      },
    });
  } catch (error) {
    console.error("Get notification stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notification statistics",
      error: error.message,
    });
  }
};

// Service Functions for Creating Notifications (Internal use)
export const createDeliveryCompletedNotification = async (
  delivery_partner_id,
  order_id
) => {
  try {
    const order = await Order.findByPk(order_id);
    return await Notification.create({
      delivery_partner_id,
      type: "delivery_completed",
      title: "Delivery Completed",
      message: `Your delivery #${order_id} has been completed successfully`,
      data: { order_id },
      priority: "medium",
    });
  } catch (error) {
    console.error("Create delivery completed notification error:", error);
  }
};

export const createPaymentReceivedNotification = async (
  delivery_partner_id,
  payment_id
) => {
  try {
    const payment = await PartnerPayment.findByPk(payment_id, {
      include: [{ model: Order, attributes: ["id"] }],
    });

    return await Notification.create({
      delivery_partner_id,
      type: "payment_received",
      title: "Payment Received",
      message: `₹${payment.amount} has been credited to your wallet for delivery #${payment.order_id}`,
      data: { payment_id, amount: payment.amount, order_id: payment.order_id },
      priority: "high",
    });
  } catch (error) {
    console.error("Create payment received notification error:", error);
  }
};

export const createNewDeliveryNotification = async (
  delivery_partner_id,
  assignment_id
) => {
  try {
    const assignment = await OrderAssignment.findByPk(assignment_id, {
      include: [{ model: Order, attributes: ["id", "delivery_address"] }],
    });

    return await Notification.create({
      delivery_partner_id,
      type: "new_delivery",
      title: "New Delivery Assigned",
      message: `You have been assigned a new delivery #${assignment.order_id} to ${assignment.Order.delivery_address}`,
      data: { assignment_id, order_id: assignment.order_id },
      priority: "high",
    });
  } catch (error) {
    console.error("Create new delivery notification error:", error);
  }
};

export const createDelayAlertNotification = async (
  delivery_partner_id,
  order_id,
  delay_minutes
) => {
  try {
    return await Notification.create({
      delivery_partner_id,
      type: "delay_alert",
      title: "Delay Alert",
      message: `Your delivery #${order_id} is delayed by ${delay_minutes} minutes`,
      data: { order_id, delay_minutes },
      priority: "urgent",
    });
  } catch (error) {
    console.error("Create delay alert notification error:", error);
  }
};

export const createAppUpdateNotification = async (
  delivery_partner_id,
  version
) => {
  try {
    return await Notification.create({
      delivery_partner_id,
      type: "app_update",
      title: "App Update Available",
      message: `New app version ${version} is available. Update now for better performance.`,
      data: { version },
      priority: "medium",
    });
  } catch (error) {
    console.error("Create app update notification error:", error);
  }
};

export const createWeeklyEarningsNotification = async (
  delivery_partner_id,
  earnings,
  week
) => {
  try {
    return await Notification.create({
      delivery_partner_id,
      type: "weekly_earnings",
      title: "Weekly Earnings Summary",
      message: `You earned ₹${earnings} this week (${week}). Keep up the good work!`,
      data: { earnings, week },
      priority: "low",
    });
  } catch (error) {
    console.error("Create weekly earnings notification error:", error);
  }
};

export const createRatingReceivedNotification = async (
  delivery_partner_id,
  order_id,
  rating
) => {
  try {
    return await Notification.create({
      delivery_partner_id,
      type: "rating_received",
      title: "New Rating Received",
      message: `You received a ${rating} star rating for delivery #${order_id}`,
      data: { order_id, rating },
      priority: "medium",
    });
  } catch (error) {
    console.error("Create rating received notification error:", error);
  }
};

export const createPromotionNotification = async (
  delivery_partner_id,
  title,
  message,
  data = {}
) => {
  try {
    return await Notification.create({
      delivery_partner_id,
      type: "promotion",
      title,
      message,
      data,
      priority: "low",
    });
  } catch (error) {
    console.error("Create promotion notification error:", error);
  }
};

// Bulk create notifications for multiple partners
export const bulkCreateNotifications = async (
  delivery_partner_ids,
  notificationData
) => {
  try {
    const notifications = delivery_partner_ids.map((partner_id) => ({
      ...notificationData,
      delivery_partner_id: partner_id,
    }));

    return await Notification.bulkCreate(notifications);
  } catch (error) {
    console.error("Bulk create notifications error:", error);
  }
};
