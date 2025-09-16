// // import { productCreateSchema } from "../validations/validation";
// import { productCreateSchema } from "../validations/product.validation.js";
// export const validate = (productCreateSchema) => {
//   return (req, res, next) => {
//     const { error } = productCreateSchema.validate(req.body, {
//       abortEarly: false,
//     });

//     if (error) {
//       const errorDetails = error.details.map((detail) => detail.message);
//       return res.status(400).json({ error: errorDetails });
//     }

//     next();
//   };
// };


export const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errorDetails = error.details.map((detail) => detail.message);
      return res.status(400).json({ error: errorDetails });
    }

    next();
  };
};