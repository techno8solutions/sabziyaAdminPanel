// // // import db from "../models/index.js";

// // // const initializeDatabase = async () => {
// // //   try {
// // //     await db.sequelize.authenticate();
// // //     console.log("✅ DB connected successfully.");

// // //     await db.sequelize.sync(); // or { force: true } for development
// // //     console.log("✅ All models synchronized with DB.");

// // //   } catch (error) {
// // //     console.error("❌ DB Initialization Error:", error);
// // //     process.exit(1);
// // //   }
// // // };

// // // export default initializeDatabase;

// // import db from "../models/index.js";

// // const initializeDatabase = async () => {
// //   try {
// //     console.log("🚀 Starting database initialization...");

// //     // Test database connection
// //     await db.sequelize.authenticate();
// //     console.log("✅ Database connection established successfully.");

// //     // Sync all models with proper dependency handling
// //     console.log("🔄 Synchronizing database...");

// //     // Option 1: Use alter instead of force for production
// //     // await db.sequelize.sync({ alter: true });

// //     // Option 2: Use force for development (CAUTION: This will drop all tables!)
// //     await db.sequelize.sync({ force: true });

// //     console.log("✅ All models synchronized with database successfully!");
// //   } catch (error) {
// //     console.error("❌ Database Initialization Error:", error);

// //     // Log more specific error details
// //     if (error.name === "SequelizeDatabaseError") {
// //       console.error("📋 SQL Error Details:");
// //       console.error("- Error Code:", error.original?.code);
// //       console.error("- SQL State:", error.original?.sqlState);
// //       console.error("- SQL Message:", error.original?.sqlMessage);
// //       console.error("- SQL Query:", error.sql);
// //     }

// //     process.exit(1);
// //   }
// // };

// // export default initializeDatabase;

// import db, { sequelize } from "../models/index.js";
// import config from "../config/index.js";
// import logger from "../config/logger.js";

// /**
//  * Sync database schema
//  */
// export const syncDatabase = async (options = {}) => {
//   const {
//     force = false,
//     alter = config.nodeEnv === "development",
//     logging = config.nodeEnv === "development",
//   } = options;

//   try {
//     logger.info("🔄 Syncing database schema...");

//     await sequelize.sync({
//       force,
//       alter,
//       logging: logging ? (msg) => logger.debug(`SQL: ${msg}`) : false,
//     });

//     logger.info("✅ Database synced successfully");
//   } catch (error) {
//     logger.error("❌ Database sync failed:", error.message);
//     throw error;
//   }
// };

// /**
//  * Schema validation
//  */
// export const validateSchema = async () => {
//   try {
//     const [results] = await sequelize.query("SHOW TABLES");
//     const tableNames = results.map((row) => Object.values(row)[0]);
//     logger.info(`📊 Found ${tableNames.length} tables`);

//     const required = ["customers", "orders", "products", "categories"];
//     const missing = required.filter((t) => !tableNames.includes(t));

//     if (missing.length) logger.warn(`⚠️ Missing tables: ${missing.join(", ")}`);
//     else logger.info("✅ All critical tables present");

//     return { tableNames, missing };
//   } catch (error) {
//     logger.error("❌ Schema validation failed:", error.message);
//     return { tableNames: [], missing: [] };
//   }
// };

// /**
//  * Health check
//  */
// export const checkDatabaseHealth = async () => {
//   try {
//     await sequelize.authenticate();
//     const [results] = await sequelize.query("SHOW TABLES");
//     return {
//       status: "healthy",
//       tableCount: results.length,
//       timestamp: new Date().toISOString(),
//     };
//   } catch (error) {
//     return {
//       status: "unhealthy",
//       error: error.message,
//       timestamp: new Date().toISOString(),
//     };
//   }
// };

// /**
//  * Initialize Database
//  */
// const initializeDatabase = async () => {
//   try {
//     logger.info("🚀 Initializing database...");

//     await syncDatabase({
//       force: process.env.DB_FORCE_SYNC === "true",
//       alter:
//         process.env.DB_ALTER_SYNC === "true" ||
//         config.nodeEnv === "development",
//     });

//     await validateSchema();

//     if (
//       config.nodeEnv === "development" ||
//       process.env.CREATE_DEFAULT_DATA === "true"
//     ) {
//       await createDefaultData();
//     }

//     const health = await checkDatabaseHealth();
//     logger.info(
//       `📊 Database health: ${health.status}, tables: ${health.tableCount}`
//     );

//     logger.info("✅ Database initialized");
//     return db;
//   } catch (error) {
//     logger.error("❌ Database initialization failed:", error.message);
//     if (config.nodeEnv !== "test") throw error;
//   }
// };

// /**
//  * Graceful shutdown
//  */
// export const closeDatabase = async () => {
//   try {
//     await sequelize.close();
//     logger.info("✅ Database connection closed");
//   } catch (error) {
//     logger.error("❌ Error closing DB:", error.message);
//   }
// };

// /**
//  * Reset Database (dangerous)
//  */
// export const resetDatabase = async () => {
//   if (config.nodeEnv === "production")
//     throw new Error("Not allowed in production");
//   logger.warn("⚠️ Resetting database...");
//   await syncDatabase({ force: true });
//   await createDefaultData();
//   logger.info("✅ Database reset completed");
// };

// // Setup graceful shutdown (skip in tests)
// if (config.nodeEnv !== "test") {
//   process.on("SIGINT", () => closeDatabase().then(() => process.exit(0)));
//   process.on("SIGTERM", () => closeDatabase().then(() => process.exit(0)));
// }

// export default initializeDatabase;

import db from "../models/index.js";

const initializeDatabase = async () => {
  try {
    await db.sequelize.authenticate();
    console.log("✅ DB connected successfully.");

    await db.sequelize.sync(); // or { force: true } for development
    console.log("✅ All models synchronized with DB.");
  } catch (error) {
    console.error("❌ DB Initialization Error:", error);
    process.exit(1);
  }
};

export default initializeDatabase;
