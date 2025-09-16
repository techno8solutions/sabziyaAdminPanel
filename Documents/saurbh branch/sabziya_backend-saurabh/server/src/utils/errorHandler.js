import ApiResponse from "../utils/ApiResponse.js";

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Sequelize validation errors
  if (err.name === "SequelizeValidationError") {
    const errors = err.errors.map((error) => ({
      field: error.path,
      message: error.message,
    }));
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Validation failed", errors));
  }

  // Sequelize unique constraint errors
  if (err.name === "SequelizeUniqueConstraintError") {
    const errors = err.errors.map((error) => ({
      field: error.path,
      message: `${error.path} already exists`,
    }));
    return res
      .status(409)
      .json(new ApiResponse(409, null, "Duplicate entry", errors));
  }

  // Sequelize foreign key constraint errors
  if (err.name === "SequelizeForeignKeyConstraintError") {
    return res
      .status(400)
      .json(
        new ApiResponse(400, null, "Invalid reference to related resource")
      );
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json(new ApiResponse(401, null, "Invalid token"));
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json(new ApiResponse(401, null, "Token expired"));
  }

  // Default error
  res.status(500).json(new ApiResponse(500, null, "Internal server error"));
};

export default errorHandler;
