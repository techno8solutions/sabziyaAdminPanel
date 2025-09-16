import express from "express";
import {
  assignOrderToPartner,
  getAllDeliveryPartners,
  getDeliveryPartnerById,
  getOrdersNeedingAssignment,
  heartbeat,
  setOffline,
  setOnline,
  verifyDeliveryPartner,
} from "../controllers/deliveryPartnerController.js";

const deliveryPartnerRouter = express.Router();

deliveryPartnerRouter.get("/get-delivery-partners", getAllDeliveryPartners);

// GET single delivery partner
deliveryPartnerRouter.get("/view-details", getDeliveryPartnerById);

// PATCH verify delivery partner
deliveryPartnerRouter.patch("/verfiy-delivery-partner", verifyDeliveryPartner);
// Delivery partners routes
deliveryPartnerRouter.get("/orders/unassigned", getOrdersNeedingAssignment);

// POST assign order to delivery partner
deliveryPartnerRouter.post("/orders/assign", assignOrderToPartner);
deliveryPartnerRouter.post("/online", setOnline);
deliveryPartnerRouter.post("/offline", setOffline);
deliveryPartnerRouter.post("/heartbeat", heartbeat);

export default deliveryPartnerRouter;
