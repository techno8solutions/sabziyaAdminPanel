import { Router } from "express";
import UserController from "../../controllers/user_mangement/customer.controller.js";

const router = Router();

// 👤 Customers
router.get("/customers", UserController.getCustomers); // GET /api/admin/customers
router.put("/customers/:id", UserController.updateCustomer); // PUT /api/admin/customers/:id
router.patch("/customers/:id/status", UserController.toggleCustomerStatus); // PATCH /api/admin/customers/:id/status

// 🎭 Role Assignment
router.patch("/users/:id/role", UserController.assignRole); // PATCH /api/admin/users/:id/role

export default router;
