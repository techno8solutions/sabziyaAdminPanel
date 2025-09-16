const express = require("express");
const router = express.Router();
const productRoutes = require("../routes/admin/product.routes")
//************************************ADMIN ROUTES*************************************** */
// router.use("/auth", require("./auth.routes"));
router.use("/v1/admin-routes", require("./admin/auth.routes"));
// router.use("/users", require("./user.routes"));

// --------------------------PRODUCT ROUTES----------------------------------------------
router.use("/v1/products", productRoutes);

module.exports = router;
