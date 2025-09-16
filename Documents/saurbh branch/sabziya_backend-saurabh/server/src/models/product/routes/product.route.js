import express from "express";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  addSynonyms,
  addProductImage,
  assignCategoryToProduct,
  getProductFilters,
  getProductsByCategory,
} from "../controller/product.controller.js";
import productUpload from "../../../config/productMulter.js";

const router = express.Router();

router.get("/", getAllProducts);
router.get("/filters", getProductFilters);
router.get("/category/:category", getProductsByCategory);
router.get("/:id", getProductById);

router.post("/create", productUpload.single("images"), createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);
router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.post("/synonym", addSynonyms);
router.post("/image", addProductImage);
router.post("/assign-cat", assignCategoryToProduct);

export default router;

// import express from "express";

// import { createProduct, deleteProduct, getAllProducts, getProductById, updateProduct } from "../controller/product.controller.js";
// import { validate } from "../../../middlewares/validate.js";
// import { create, update } from "../../../validations/validation.js";
// const productRoutes  = express.Router();

// // Create product
// productRoutes.post("/create", validate(create), createProduct);

// // Get all products
// productRoutes.get("/get-all-products", getAllProducts);

// // Get product by ID
// productRoutes.get("/:id", getProductById);

// // Update product
// productRoutes.put("/:id", validate(update), updateProduct);

// // Delete product
// productRoutes.delete("/:id", deleteProduct);

// export default productRoutes;
