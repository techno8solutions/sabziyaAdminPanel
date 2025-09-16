// import Category from "../models/category.model.js"; // adjust path if needed
import db from "../../index.js";
import fs from 'fs';
import path from 'path';
const {Category} = db;
// Create new category
const cleanupFile = (file) => {
  if (file && file.path && fs.existsSync(file.path)) {
    fs.unlinkSync(file.path);
  }
};

// Create category with image upload
export const createCategory = async (req, res) => {
  let uploadedFile = null;

  try {
    // Multer puts the single uploaded file on req.file
    const file = req.file;
    uploadedFile = file;

    const { name, description, status } = req.body;

    // Validate required fields
    if (!name || !description) {
      cleanupFile(file);
      return res.status(400).json({
        success: false,
        message: "Name and description are required",
      });
    }

    // Create category data object
    const categoryData = {
      name,
      description,
      status: status || "active",
    };

    // Add image URL if file was uploaded
    if (file) {
      categoryData.image_url = `/uploads/categories/${path.basename(file.path)}`;
    }

    // Create category
    const newCategory = await Category.create(categoryData);

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: newCategory,
    });
  } catch (error) {
    // Clean up uploaded file if error occurs
    cleanupFile(uploadedFile);

    console.error("Error creating category:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating category",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};


// Get all categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    return res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// Get category by ID
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.status(200).json(category);
  } catch (error) {
    console.error("Error fetching category:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// Update category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;
    console.log("req.body", req.body);
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    category.name = name || category.name;
    category.description = description || category.description;
    category.status = status || category.status;

    await category.save();

    return res.status(200).json(category);
  } catch (error) {
    console.error("Error updating category:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// Delete category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    await category.destroy();
    return res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
    