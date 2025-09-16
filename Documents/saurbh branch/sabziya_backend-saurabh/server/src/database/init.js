const db = require("../models");

const initializeDatabase = async () => {
  try {
    await db.sequelize.authenticate();
    console.log("DB connected successfully.");

    await db.sequelize.sync(); // or { force: true } for dev
    console.log("All models synchronized with DB.");
  } catch (error) {
    console.error("DB Initialization Error:", error);
    process.exit(1);
  }
};

module.exports = initializeDatabase;
