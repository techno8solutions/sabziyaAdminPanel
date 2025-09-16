import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import compression from "compression";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import config from "./config/index.js";
import logger from "./config/logger.js";
import routes from "./models/index.route.js";
import { sequelize } from "./models/index.js";
import initializeDatabase from "./db/init.js";
import { setContext } from "./middlewares/auth.middleware.js";
import deliveryPartnerRouter from "./models/delivery_partner/routes/deliveryPartnerAuth.routes.js";
import deliveryPartnerAssignmentRouter from "./models/delivery_partner/routes/deliveryPartnerAssignment.route.js";
import otpRouter from "./models/order/routes/orderOtp.route.js";
import notificationRouter from "./models/delivery_partner/routes/notification.routes.js";
import "../src/utils/scheduledNotifications.js";
import path from "path";
import { fileURLToPath } from "url";
dotenv.config();
const app = express();

// Security Headers
app.use(helmet());

// Logger Setup
if (config.nodeEnv === "development") {
  app.use(morgan("dev"));
} else if (config.nodeEnv === "production") {
  app.use(morgan("combined", { stream: logger.stream }));
}
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve uploads folder as static
app.use(
  cors({
    origin: "http://localhost:5173", // your React frontend origin
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Serve static files with CORS headers
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"), {
    setHeaders: (res) => {
      res.set("Access-Control-Allow-Origin", "*"); // or restrict to frontend URL
    },
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression());
// app.use(setContext);

app.use((req, res, next) => {
  req.method = req.method.toUpperCase();
  logger.info(
    `Request: ${req.method} ${req.originalUrl} - IP: ${
      req.ip
    } - Body: ${JSON.stringify(req.body)}`
  );
  next();
});

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    statusCode: 429,
    error: "Too many requests, please try again later.",
    retryAfter: 15 * 60,
  },
  handler: (req, res, next, options) => {
    logger.warn(
      `Rate limit exceeded: ${req.ip} - ${req.method} ${req.originalUrl}`
    );
    res.status(options.statusCode).json({ error: options.message });
  },
});

app.use("/api", limiter);

// Routes
app.use("/api", routes);

//delivery partner specific routes
app.use("/api/delivery-partner/auth", deliveryPartnerRouter);
app.use("/api/delivery-partner/assign", deliveryPartnerAssignmentRouter);
app.use("/api/otp", otpRouter);
app.use("/api/delivery-partner/notifications", notificationRouter);

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date() });
});

// Handle wrong / unavailable routes
app.use((req, res) => {
  res.status(404).json({
    error: true,
    message: "Route not found or unavailable",
    requestedUrl: req.originalUrl,
  });
});

// DB Init (except in test env)
if (config.nodeEnv !== "test") {
  sequelize
    .authenticate()
    .then(() => logger.info("✅ Database connected"))
    .catch((err) => logger.error("❌ DB connection error:", err));

  initializeDatabase().catch((err) => {
    logger.error("❌ DB Initialization Error:", err);
  });
}

export default app;
