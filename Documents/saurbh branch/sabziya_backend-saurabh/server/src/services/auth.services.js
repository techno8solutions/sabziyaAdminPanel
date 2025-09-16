import bcrypt from "bcrypt";
import { signJwt } from "../utils/auth.js";
// import adminModel from "../models/admin/models/admin.model.js";
import db from "../models/index.js"
const {Admin} = db;
export const registerAdmin = async ({ username, password, role }) => {
  const existing = await Admin.findOne({ where: { username } });
  if (existing) throw new Error("Username already exists");

  const password_hash = await bcrypt.hash(password, 12);

  const admin = await Admin.create({
    username,
    password_hash,
    role: role || "admin",
    createdAt: new Date(),
  });

  return {
    message: "Admin registered successfully",
    admin: {
      id: admin.id,
      username: admin.username,
      role: admin.role,
    },
  };
};

export const loginAdmin = async ({ username, password }) => {
  const admin = await Admin.findOne({ where: { username } });
  if (!admin) throw new Error("Invalid username or password");

  const isMatch = await bcrypt.compare(password, admin.password_hash);
  if (!isMatch) throw new Error("Invalid username or password");

  const token = signJwt({
    id: admin.id,
    username: admin.username,
    role: admin.role,
  });

  // Store token in DB
  await Admin.update(
    {
      cookie: token,
      lastLoggedIn: new Date(),
    },
    { where: { id: admin.id } }
  );

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

export const logoutAdmin = async (userId) => {
  await Admin.update(
    {
      lastLoggedOut: new Date(),
      cookie: "",
    },
    { where: { id: userId } }
  );
};

export const getAdminById = async (userId) => {
  return await Admin.findByPk(userId, {
    attributes: { exclude: ["password_hash", "cookie"] },
  });
};
