const request = require("supertest");
const app = require("../../src/app");
const { sequelize } = require("../../src/models");

describe(" Admin Auth Tests", () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  const adminPayload = {
    username: "admin_test",
    password: "admin123",
    role: "manager",
  };

  test(" Signup Admin", async () => {
    const res = await request(app)
      .post("/api/v1/admin-routes/signup")
      .send(adminPayload);

    expect(res.statusCode).toBe(201);
    expect(res.body.user).toHaveProperty("username", adminPayload.username);
    expect(res.body).toHaveProperty("token");
  });

  test("Login Admin with correct credentials", async () => {
    const res = await request(app).post("/api/v1/admin-routes/login").send({
      username: adminPayload.username,
      password: adminPayload.password,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  test("Fail login with wrong password", async () => {
    const res = await request(app).post("/api/v1/admin-routes/login").send({
      username: adminPayload.username,
      password: "wrongpassword",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("message");
  });
});
