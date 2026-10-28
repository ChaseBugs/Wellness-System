const dotenv = require("dotenv");

dotenv.config();

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/height_increase",
  jwtSecret: process.env.JWT_SECRET || "dev-secret-change-before-production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  corsOrigin: process.env.CORS_ORIGIN || "*",
  adminEmail: process.env.ADMIN_EMAIL || "admin@height.local",
  adminPassword: process.env.ADMIN_PASSWORD || "Admin123!"
};

module.exports = env;
