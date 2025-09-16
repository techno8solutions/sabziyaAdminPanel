import express from "express";

import authMiddleware from "../../../middlewares/authenticate.js";
import adminMiddleware from "../../../middlewares/admin.middleware.js";

import orderManagementRoutes from "../routes/order_management/order_management.route.js";
import dashboardRutes from "../routes/dashboard/dashboard.routes.js";

import customerManagementRoutes from "./user_management/customer.routes.js"
import deliveryPartnerManagementRoutes from "./user_management/deliveryPartnerroutes.js"
import { isAdmin, isAuth } from "../../../middlewares/auth.middleware.js";
const adminRoutes = express.Router();

// ✅ Apply authentication and admin middleware globally
// adminRoutes.use(authMiddleware, adminMiddleware);
// adminRoutes.use(isAuth, isAdmin);

// Order Management Routes
adminRoutes.use("/orders", orderManagementRoutes);

// dashboard Routes
adminRoutes.use("/dashboard", dashboardRutes);

// User Management Routes
adminRoutes.use("/userManagement",customerManagementRoutes)
adminRoutes.use("/userManagement",deliveryPartnerManagementRoutes)

export default adminRoutes;
