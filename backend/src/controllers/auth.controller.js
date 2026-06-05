const authService = require("../services/auth.service");
const token = require("../utils/token");

const COOKIE_OPTIONS = {
  httpOnly: true, // JS phía client không đọc được
  secure: process.env.NODE_ENV === "production", // chỉ HTTPS ở production
  sameSite: "strict", // chống CSRF
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày (ms)
};

exports.login = async (req, res, next) => {
  try {
    const { accessToken, refreshToken, staff } = await authService.login(
      req.body,
    );
    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
    res.json({ success: true, accessToken, staff });
  } catch (err) {
    next(err);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const { accessToken } = await authService.refresh(req.cookies.refreshToken);
    res.json({ success: true, accessToken });
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    await authService.logout(req.cookies.refreshToken);
    res.clearCookie("refreshToken", COOKIE_OPTIONS);
    res.json({ success: true, message: "Đăng xuất thành công" });
  } catch (err) {
    next(err);
  }
};
