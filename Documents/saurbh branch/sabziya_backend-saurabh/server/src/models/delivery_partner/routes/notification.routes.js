// routes/notificationRoutes.js
import express from "express";
import {
  deleteNotification,
  getNotifications,
  getNotificationStats,
  getUnreadNotificationCount,
  markAllAsRead,
  markAllNotificationsAsRead,
  markAsRead,
  markNotificationAsRead,
} from "../controllers/notificationController.js";

const notificationRouter = express.Router();
// const express = require("express");
// const router = express.Router();
// const auth = require("../middleware/auth");
// const notificationController = require("../controllers/notificationController");

// Get notifications
notificationRouter.get("/", getNotifications);
notificationRouter.put("/read", markNotificationAsRead);
notificationRouter.put("/read-all", markAllNotificationsAsRead);
notificationRouter.get("/unread-count", getUnreadNotificationCount);
// Mark as read
notificationRouter.patch("/:notification_id/read", markAsRead);

// Mark all as read
notificationRouter.patch("/read-all", markAllAsRead);

// Delete notification
notificationRouter.delete("/delete-notification", deleteNotification);

// Get notification statistics
notificationRouter.get("/stats", getNotificationStats);

export default notificationRouter;
