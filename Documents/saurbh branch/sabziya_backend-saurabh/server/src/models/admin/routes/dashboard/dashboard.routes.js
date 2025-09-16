import express from "express";

import dashboardController from "../../controllers/dashboard_overview/dashboardController.js";
const DashboardRoutes = express.Router();

// Dashboard routes
DashboardRoutes.get("/overview", dashboardController.getOverview);
DashboardRoutes.get("/charts", dashboardController.getChartsData);
DashboardRoutes.get("/recent-orders", dashboardController.getRecentOrders);
DashboardRoutes.get(
  "/order-status-distribution",
  dashboardController.getOrderStatusDistribution
);
DashboardRoutes.get("/data", dashboardController.getDashboardData);
DashboardRoutes.get(
  "/delivery-tracking",
  dashboardController.getDeliveryTracking
);

export default DashboardRoutes;
