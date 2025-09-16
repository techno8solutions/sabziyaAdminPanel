// import UserModel from "../../model/NewModel/userModel.js";
// import adminModel from "../models/admin/models/admin.model.js";
import { Admin } from "../models/index.js";
import { verifyJwt } from "../utils/auth.js";

export const isAuth = async (req, res, next) => {
  try {
    console.log("req.context", req.context);

    if (!req?.context?.user && !req?.context?.admin) {
      res.status(401).json({
        message: "Please Logged in",
        success: false,
      });
      return;
    }
    next();
  } catch (error) {
    console.log("error in isAuth middleware", error);

    res.status(error.status || 500).json({
      message: error.message,
    });
    return;
  }
};

export const isAdmin = async (req, res, next) => {
  try {
    let context = {
      user: undefined,
      role: undefined,
      uuid: undefined,
    };
    if (!req?.context?.user) {
      res.status(401).json({
        message: "Please Logged in",
        success: false,
      });
      return;
    }
    // const admin = await adminModel
    //   .findById(req.context.user)
    //   .select("_id role cookie access uuid")
    //   .lean();

    const admin = await Admin.findByPk(req.context.user, {
      attributes: ["id", "role", "cookie", "access", "uuid"],
      raw: true,
    });

    // get token from the db decode it and compare it with uuid

    const decodeToken = verifyJwt(admin?.cookie);

    if (decodeToken?.uuid !== req.context?.uuid) {
      res.status(201).send({ message: "Please loggedIn.", success: false });
      return;
    }

    if (!admin) {
      return res.status(400).json({
        message: "Admin not found",
        success: false,
      });
    }

    context = {
      user: admin?._id,
      role: admin?.role,
      uuid: admin?.uuid,
    };

    req.context = context;
    next();
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message,
    });
    return;
  }
};

// export const setContext = async (req, res, next) => {
//   try {
//     let context = {
//       user: undefined,
//       role: undefined,
//       uuid: undefined,
//     };
//     console.log("set context:", req.cookies);

//     if (req?.cookies.accessToken) {
//       const user = verifyJwt(req.cookies.accessToken);
//       context.user = user?.user;
//       context.role = user?.role;
//       context.uuid = user?.uuid || "unique id";
//     }

//     req.context = context;

//     console.log("set context:", context);

//     next();
//   } catch (error) {
//     res.status(500).json({
//       message: "Internal Server Error",
//     });
//   }
// };


export const setContext = async (req, res, next) => {
  try {
    let token =
      req.cookies?.accessToken ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null);

    // Default context
    let context = {
      user: null,
      role: null,
      uuid: null,
    };

    if (token) {
      // Try custom verifyJwt first
      const { valid, decoded } = verifyJwt(token);

      if (valid && decoded) {
        context.user = decoded.id || decoded.user;
        context.role = decoded.role || null;
        context.uuid = decoded.uuid || null;
      } else {
        // Fallback to direct jwt.verify
        try {
          const decodedUser = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
          context.user = decodedUser.id || decodedUser.user;
          context.role = decodedUser.role || null;
          context.uuid = decodedUser.uuid || null;
        } catch (err) {
          return res.status(403).json({
            status: 403,
            message: "Invalid or expired token",
          });
        }
      }
    }

    // Attach context to request
    req.context = context;

    console.log("✅ set context:", context);
    next();
  } catch (error) {
    console.error("❌ setContext error:", error.message);
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
    });
  }
};
