import * as authService from "../../../services/auth.services.js";

// Get current user
export const me = async (req, res) => {
  try {
    const user = await authService.getAdminById(req.context?.user);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    const { password_hash, cookie, ...safeUser } = user.dataValues;

    res
      .status(200)
      .json({ success: true, message: "User data", data: safeUser });
  } catch (err) {
    console.error("Me error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const adminSignup = async (req, res, next) => {
  console.log("Admin signup request:", req.body);
  
  try {
    const response = await authService.registerAdmin(req.body);
    console.log("response", response);
    if (response) {
      res.status(201).json(response);
    }
  } catch (error) {
    console.error("Register error:", error);
    next(error);
  }
};

export const adminLogin = async (req, res, next) => {
  try {
    const { token, admin, message } = await authService.loginAdmin(req.body);

    // Set cookie
    res.cookie("accessToken", token, {
      maxAge: 2.592e9, // 30 days
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
    });

    res.status(200).json({ success: true, token, admin, message });
    console.info(
      `[${new Date().toISOString()}] Login attempt: ${
        req.body.username
      } - IP: ${req.ip}`
    );

  } catch (error) {
    console.error("Login error:", error);
    next(error);
  }
};

export const adminLogout = async (req, res) => {
  try {
    const userId = req.context?.user;
    if (!userId)
      return res.status(401).json({ message: "Unauthorized", success: false });

    // Clear cookie
    res.cookie("accessToken", "", {
      maxAge: 0,
      httpOnly: true,
      expires: new Date(0),
    });

    await authService.logoutAdmin(userId);

    res.status(200).json({ success: true, message: "User logged out." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
