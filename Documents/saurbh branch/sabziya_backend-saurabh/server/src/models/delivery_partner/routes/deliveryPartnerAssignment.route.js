import express from "express";
import { getAssignedOrders, updateOrderStatus } from "../controllers/deliveryPartnerAssignment.controller.js";

const deliveryPartnerAssignmentRouter = express.Router();

deliveryPartnerAssignmentRouter.get("/assign-orders", getAssignedOrders);
deliveryPartnerAssignmentRouter.put("/update-order-status", updateOrderStatus);

export default deliveryPartnerAssignmentRouter;
