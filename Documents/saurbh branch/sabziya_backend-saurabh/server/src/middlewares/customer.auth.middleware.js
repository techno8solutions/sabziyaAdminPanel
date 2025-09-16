import jwt from "jsonwebtoken";

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      status: 401,
      message: "Access token required",
    });
  }

  jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        status: 403,
        message: "Invalid or expired token",
      });
    }

    req.user = user;
    next();
  });
};

export default authenticateToken;
