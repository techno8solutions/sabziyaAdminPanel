const express = require("express");
const router = express.Router();
const authController = require("../../controllers/admin/auth.controller");

// Admin Auth Routes
router.post("/signup", authController.adminSignup);
router.post("/login", authController.adminLogin);

module.exports = router;
