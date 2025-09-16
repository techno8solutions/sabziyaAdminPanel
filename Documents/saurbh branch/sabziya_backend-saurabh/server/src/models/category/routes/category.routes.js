import express from "express";
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";
import categoryUpload from "../../../config/categoryMulter.js";

const router = express.Router();

router.post("/create", categoryUpload.single("image"), createCategory);

router.get("/get-all", getCategories); // Get all categories
router.get("/:id", getCategoryById); // Get category by id
router.put("/:id", updateCategory); // Update category
router.delete("/:id", deleteCategory); // Delete category

export default router;
