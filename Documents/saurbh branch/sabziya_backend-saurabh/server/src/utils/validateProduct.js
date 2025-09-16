const validateProductFields = (body) => {
  const errors = [];

  if (!body.p_title || typeof body.p_title !== "string") {
    errors.push("Product title is required and must be a string.");
  }

  if (body.p_description && typeof body.p_description !== "string") {
    errors.push("Description must be a string.");
  }

  if (body.price === undefined || isNaN(body.price)) {
    errors.push("Price is required and must be a number.");
  }

  if (
    body.stock_quantity !== undefined &&
    (!Number.isInteger(body.stock_quantity) || body.stock_quantity < 0)
  ) {
    errors.push("Stock quantity must be a non-negative integer.");
  }

  if (body.unit && typeof body.unit !== "string") {
    errors.push("Unit must be a string.");
  }

  if (body.status && !["active", "inactive"].includes(body.status)) {
    errors.push("Status must be either 'active' or 'inactive'.");
  }

  return errors;
};
export default validateProductFields;