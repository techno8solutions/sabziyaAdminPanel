const express = require("express");
const router = express.Router();
const productController = require("../../controllers/admin/product.controller");
const validate = require("../../middlewares/validate.middleware");
const productValidation = require("../../validations/product.validation");

// Create product
router.post(
  "/create",
  validate(productValidation.create),
  productController.createProduct 
);
console.log("productValidation.create:", productValidation.create);


// Get all products
router.get("/get-all-products", productController.getAllProducts);

// Get product by ID
router.get("/:id", productController.getProductById);

// Update product
router.put(
  "/:id",
  validate(productValidation.update),
  productController.updateProduct
);

// Delete product
router.delete("/:id", productController.deleteProduct);

module.exports = router;
