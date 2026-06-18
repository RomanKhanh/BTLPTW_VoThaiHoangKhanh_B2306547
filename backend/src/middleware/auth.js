const { verifyAccessToken } = require("../utils/token");

const WHITELIST = [
  { path: "/api/auth/login", method: "POST" },
  { path: "/api/auth/refresh", method: "POST" },
  { path: "/api/auth/logout", method: "POST" },
  { path: "/api/staff", method: "POST" },
];

const isWhitelisted = (req) =>
  WHITELIST.some(
    (item) => item.path === req.originalUrl && item.method === req.method,
  );

const authenticate = (req, res, next) => {
  if (isWhitelisted(req)) return next();

  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ success: false, message: "Chưa đăng nhập" });
  }

  try {
    req.user = verifyAccessToken(token);
    req.userRole = req.user.role;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Token hết hạn" });
  }
};

const requireRoles =
  (...allowedRoles) =>
  (req, res, next) => {
    if (!req.userRole) {
      return res
        .status(401)
        .json({ success: false, message: "Chưa đăng nhập" });
    }

    if (!allowedRoles.includes(req.userRole)) {
      return res
        .status(403)
        .json({ success: false, message: "Không có quyền truy cập" });
    }

    next();
  };

//Kiem tra chi dc xem du lieu cua chinh minh
const requireSelfOrStaff =
  (paramName, tokenField = "_id") =>
  (req, res, next) => {
    if (!req.userRole) {
      return res
        .status(401)
        .json({ success: false, message: "Chưa đăng nhập" });
    }

    if (req.userRole === "staff") {
      return next();
    }

    if (
      req.userRole === "reader" &&
      req.user?.[tokenField] === req.params[paramName]
    ) {
      return next();
    }

    return res
      .status(403)
      .json({ success: false, message: "Không có quyền truy cập" });
  };

module.exports = Object.assign(authenticate, {
  requireRoles,
  requireSelfOrStaff,
});
