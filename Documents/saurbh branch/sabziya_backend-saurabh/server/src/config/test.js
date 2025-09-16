export default{
  port: process.env.PORT || 5001,
  nodeEnv: process.env.NODE_ENV || "test",
  db: {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "test_user",
    password: process.env.DB_PASS || "test_password",
    name: process.env.DB_NAME || "sabziya_test",
  },
  jwtSecret: process.env.JWT_SECRET || "test_secret",
};
