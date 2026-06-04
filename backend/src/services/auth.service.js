const { Staff, RefreshToken } = require("../models/");
const token = require("../utils/token");

exports.login = async ({ MSNV, Password }) => {
  const staff = await Staff.findOne({ MSNV });
  if (!staff) {
    throw { status: 401, message: "Sai tài khoản hoặc mật khẩu" };
  }
  const isMatch = await staff.comparePassword(Password);
  if (!isMatch) {
    throw { status: 401, message: "Sai tài khoản hoặc mật khẩu" };
  }

  const payload = { MSNV: staff.MSNV, ChucVu: staff.ChucVu };
  const accessToken = token.generateAccessToken(payload);
  const refreshToken = token.generateRefreshToken(payload);

  // Lưu refresh token vào database
  await RefreshToken.create({
    token: refreshToken,
    MSNV: staff.MSNV,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
  return {
    accessToken,
    refreshToken,
    staff: {
      MSNV: staff.MSNV,
      HoTenNV: staff.HoTenNV,
      ChucVu: staff.ChucVu,
    },
  };
};

exports.refresh = async (refreshToken) => {
  if (!refreshToken) {
    throw { status: 400, message: "Refresh token không tồn tại" };
  }
  const storedToken = await RefreshToken.findOne({ token: refreshToken });
  if (!storedToken) {
    throw { status: 400, message: "Refresh token không hợp lệ" };
  }
  const decoded = token.verifyRefreshToken(refreshToken);
  const accessToken = token.generateAccessToken({
    MSNV: decoded.MSNV,
    ChucVu: decoded.ChucVu,
  });
  return { accessToken };
};

exports.logout = async (refreshToken) => {
  if (refreshToken) {
    await RefreshToken.deleteOne({ token: refreshToken });
  }
  return {
    EC: 0,
    EM: "Đăng xuất thành công",
  };
};
