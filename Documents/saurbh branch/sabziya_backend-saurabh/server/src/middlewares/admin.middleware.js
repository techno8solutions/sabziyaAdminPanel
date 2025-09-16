import ApiResponse from "../utils/ApiResponse.js";

const adminMiddleware = (req, res, next) => {
  if (!req.user || !["admin", "restaurant_owner"].includes(req.user.role)) {
    return res
      .status(403)
      .json(new ApiResponse(403, null, "Admin access required"));
  }
  next();
};

export default adminMiddleware;
