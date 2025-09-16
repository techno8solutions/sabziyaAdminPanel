// utils/scheduledNotifications.js
import cron from "node-cron";
import db from "../models/index.js";
const { DeliveryPartner, OrderAssignment, PartnerPayment, sequelize } = db;
import {
  createWeeklyEarningsNotification,
  createDelayAlertNotification,
  createAppUpdateNotification,
} from "../models/delivery_partner/controllers/notificationController.js";
import { Op } from "sequelize";

// Weekly earnings notification (runs every Sunday at 11 PM)
cron.schedule("0 23 * * 0", async () => {
  try {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const partners = await DeliveryPartner.findAll({
      where: { is_active: true },
    });

    for (const partner of partners) {
      const weeklyEarnings = await PartnerPayment.sum("amount", {
        where: {
          delivery_partner_id: partner.id,
          status: "completed",
          created_at: { [Op.gte]: oneWeekAgo },
        },
      });

      if (weeklyEarnings > 0) {
        const week = `Week ${Math.ceil(new Date().getDate() / 7)}`;
        await createWeeklyEarningsNotification(
          partner.id,
          weeklyEarnings,
          week
        );
      }
    }
  } catch (error) {
    console.error("Weekly earnings notification error:", error);
  }
});

// Delay alert check (runs every 30 minutes)
cron.schedule("*/30 * * * *", async () => {
  try {
    const delayedAssignments = await OrderAssignment.findAll({
      where: {
        status: ["accepted", "picked_up"],
        estimated_delivery_time: { [Op.lt]: new Date() },
      },
      include: [{ model: Order }],
    });

    for (const assignment of delayedAssignments) {
      const delayMinutes = Math.floor(
        (new Date() - assignment.estimated_delivery_time) / (1000 * 60)
      );
      await createDelayAlertNotification(
        assignment.delivery_partner_id,
        assignment.order_id,
        delayMinutes
      );
    }
  } catch (error) {
    console.error("Delay alert notification error:", error);
  }
});

// App update notification (runs daily at 9 AM)
cron.schedule("0 9 * * *", async () => {
  try {
    // This would typically check your app version API
    const latestVersion = "2.1.0"; // Get from your API

    const partners = await DeliveryPartner.findAll({
      where: { is_active: true },
    });

    for (const partner of partners) {
      // Check if partner needs update (you'd store current version in partner profile)
      await createAppUpdateNotification(partner.id, latestVersion);
    }
  } catch (error) {
    console.error("App update notification error:", error);
  }
});
