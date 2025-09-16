const authService = require("../../services/admin/auth.service");

exports.adminSignup = async (req, res, next) => {
  try {
    const response = await authService.registerAdmin(req.body);
    res.status(201).json(response);
  } catch (error) {
    console.log("register error:", error);
    next(error);
  }
};

exports.adminLogin = async (req, res, next) => {
  try {
    const response = await authService.loginAdmin(req.body);
    res.status(200).json(response);
  } catch (error) {
    console.log("error:", error);
    next(error);
  }
};
