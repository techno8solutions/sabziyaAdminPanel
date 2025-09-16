export default {
  port: process.env.PORT || 80,

  db: {
    host: process.env.DB_HOST || "",
    user: process.env.DB_USER || "",
    password: process.env.DB_PASS || "",
    name: process.env.DB_NAME || "",
  },

  jwtSecret: process.env.JWT_SECRET || "",

  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || "",
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || "",
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n") || "",
  },

  email: {
    service: process.env.EMAIL_SERVICE || "",
    user: process.env.EMAIL_USER || "",
    pass: process.env.EMAIL_PASS || "",
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "",
  },

  fcmServerKey: process.env.FCM_SERVER_KEY || "",

  oneSignal: {
    appId: process.env.ONESIGNAL_APP_ID || "",
    apiKey: process.env.ONESIGNAL_API_KEY || "",
  },

  payment: {
    stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
    razorpayKeyId: process.env.RAZORPAY_KEY_ID || "",
    razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || "",
  },
  jwt: {
    PRIVATE_KEY: process.env.PRIVATE_KEY,
    PUBLIC_KEY: process.env.PUBLIC_KEY,
  },
  email: {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === "true",
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASS,
    from: process.env.EMAIL_FROM || "default@example.com",
  },
};
