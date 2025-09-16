
const Joi = require("joi");

const create = {
  body: Joi.object({
    p_title: Joi.string().required(),
    p_description: Joi.string().optional().allow(""),
    price: Joi.number().required(),
    stock_quantity: Joi.number().integer().min(0).required(),
    unit: Joi.string().valid("kg", "g", "litre", "piece", "dozen").required(),
    status: Joi.string().valid("active", "inactive").default("active"),
  }),
};

const update = {
  body: Joi.object({
    p_title: Joi.string().optional(),
    p_description: Joi.string().optional().allow(""),
    price: Joi.number().optional(),
    stock_quantity: Joi.number().integer().min(0).optional(),
    unit: Joi.string().valid("kg", "g", "litre", "piece", "dozen").optional(),
    status: Joi.string().valid("active", "inactive").optional(),
  }),
};

module.exports = {
  create,
  update,
};
