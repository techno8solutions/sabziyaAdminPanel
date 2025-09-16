process.env.NODE_ENV = "test";
process.env.PORT = 9999;

const { sequelize } = require("../src/models"); // ✅ Add this line

jest.setTimeout(30000);

beforeAll(async () => {
  await sequelize.sync({ force: true }); // ✅ Reset DB before tests
});

afterAll(async () => {
  await sequelize.close(); // ✅ Close DB connection after tests
});
