// middlewares/validate.middleware.js
const Joi = require("joi");

const validate = (schema) => {
  return (req, res, next) => {
    const validationParts = ["body", "params", "query"];

    for (let part of validationParts) {
      if (schema[part]) {
        const { error } = schema[part].validate(req[part]);

        if (error) {
          return res.status(400).json({
            message: `Validation error in ${part}`,
            details: error.details.map((d) => d.message),
          });
        }
      }
    }

    next();
  };
};

module.exports = validate;
