import { Router } from "express";
import DeliveryPartnerController from "../../controllers/user_mangement/deliveryPartner.controller.js";

const router = Router();

// 🚚 Delivery Partners
router.post("/partners", DeliveryPartnerController.onboardPartner); // POST /api/admin/partners
router.patch("/partners/:id/approve", DeliveryPartnerController.approvePartner); // PATCH /api/admin/partners/:id/approve
router.patch("/partners/:id/suspend", DeliveryPartnerController.suspendPartner); // PATCH /api/admin/partners/:id/suspend
router.patch("/partners/:id/zone", DeliveryPartnerController.assignZone); // PATCH /api/admin/partners/:id/zone

// 🎓 Student Partner Filtering
router.get(
  "/partners/students",
  DeliveryPartnerController.filterStudentPartners
); // GET /api/admin/partners/students

export default router;
