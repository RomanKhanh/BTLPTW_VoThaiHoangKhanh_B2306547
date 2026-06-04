const { verifyAccessToken } = require("../utils/token");

const WHITELIST = [
  { path: "/api/auth/login", method: "POST" },
  { path: "/api/auth/refresh", method: "POST" },
  { path: "/api/auth/logout", method: "POST" },
];

const isWhitelisted = (req) =>
  WHITELIST.some(
    (item) => item.path === req.path && item.method === req.method,
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
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Token hết hạn" });
  }
};

module.exports = authenticate;
