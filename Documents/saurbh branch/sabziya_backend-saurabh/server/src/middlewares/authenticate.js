// const jwt = require("jsonwebtoken");

// module.exports = (req, res, next) => {
//   const authHeader = req.headers.authorization;

//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     return res.status(401).json({ message: "Unauthorized" });
//   }

//   const token = authHeader.split(" ")[1];
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch (err) {
//     return res.status(403).json({ message: "Invalid token" });
//   }
// };

import jwt from "jsonwebtoken";
import ApiResponse from "../utils/ApiResponse.js";

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    console.log("Auth header:", authHeader);

    if (!authHeader) {
      return res
        .status(401)
        .json(new ApiResponse(401, null, "Authorization header missing"));
    }

    // Expected format: "Bearer <token>"
    const token = authHeader.split(" ")[1];
    console.log("token:", token);
    if (!token) {
      return res
        .status(401)
        .json(
          new ApiResponse(401, null, "Token missing in Authorization header")
        );
    }
    console.log("JWT_SECRET:", process.env.JWT_SECRET);

    // Verify token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res
          .status(403)
          .json(new ApiResponse(403, null, "Invalid or expired token"));
      }

      req.user = decoded; // attach user info to request

      console.log("decoded:", decoded);

      next();
    });
  } catch (error) {
    console.error("AuthMiddleware Error:", error);
    res
      .status(500)
      .json(
        new ApiResponse(500, null, "Internal server error in authentication")
      );
  }
};



export default authenticate;
