import Joi from "joi";

const commonFields = {
  p_title: Joi.string(),
  p_description: Joi.string().allow(""),
  price: Joi.number(),
  stock_quantity: Joi.number().integer().min(0),
  unit: Joi.string().valid("kg", "g", "litre", "piece", "dozen"),
  status: Joi.string().valid("active", "inactive"),
};

// export const create = {
//   body: Joi.object({
//     ...commonFields,
//     p_title: commonFields.p_title.required(),
//     price: commonFields.price.required(),
//     stock_quantity: commonFields.stock_quantity.required(),
//     unit: commonFields.unit.required(),
//     status: commonFields.status.default("active"),
//   }),
// };

// export const update = {
//   body: Joi.object(commonFields),
// };
export const adminSignupSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  // email: Joi.string().email().required(),
  // email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("superadmin", "manager", "support").required(),
});

// Admin Login Validation
export const adminLoginSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  // email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// src/validations/validation.js
// import Joi from "joi";

// Create Product Validation
export const create = Joi.object({
  p_title: Joi.string().required(),
  p_description: Joi.string().allow(""),
  price: Joi.number().precision(2).required(),
  stock_quantity: Joi.number().integer().min(0).required(),
  categories: Joi.string().required(),
  unit: Joi.string().valid("kg", "ltr", "pcs").default("kg"),
  status: Joi.string().valid("active", "inactive").default("inactive"),
});

// Update Product Validation
export const update = Joi.object({
  p_title: Joi.string(),
  p_description: Joi.string().allow(""),
  price: Joi.number().precision(2),
  stock_quantity: Joi.number().integer().min(0),
  categories: Joi.string(),
  unit: Joi.string().valid("kg", "ltr", "pcs"),
  status: Joi.string().valid("active", "inactive"),
});
