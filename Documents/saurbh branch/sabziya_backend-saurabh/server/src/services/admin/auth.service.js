const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Admin } = require("../../models");
const generateToken = require("../../utils/generateToken");

exports.registerAdmin = async ({ username, password, role }) => {
  const existing = await Admin.findOne({ where: { username } });
  if (existing) throw new Error("Username already exists");

  const password_hash = await bcrypt.hash(password, 12);

  const admin = await Admin.create({ username, password_hash, role });

  return {
    message: "Admin registered successfully",
    admin: {
      id: admin.id,
      username: admin.username,
      role: admin.role,
    },
  };
};

exports.loginAdmin = async ({ username, password }) => {
  const admin = await Admin.findOne({ where: { username } });
  if (!admin) throw new Error("Invalid username or password");

  const isMatch = await bcrypt.compare(password, admin.password_hash);
  if (!isMatch) throw new Error("Invalid username or password");

  const token = generateToken({
    id: admin.id,
    username: admin.username,
    role: admin.role,
  });

  return {
    message: "Login successful",
    token,
    admin: {
      id: admin.id,
      username: admin.username,
      role: admin.role,
    },
  };
};
