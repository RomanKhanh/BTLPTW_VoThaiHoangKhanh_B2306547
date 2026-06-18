const { Staff, RefreshToken, Reader } = require("../models/");
const token = require("../utils/token");

const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60 * 1000;

function buildStaffTokens(staff) {
  const payload = {
    role: "staff",
    MSNV: staff.MSNV,
    ChucVu: staff.ChucVu,
  };

  return {
    accessToken: token.generateAccessToken(payload),
    refreshToken: token.generateRefreshToken({
      role: payload.role,
      accountId: payload.MSNV,
      MSNV: payload.MSNV,
      ChucVu: payload.ChucVu,
    }),
    role: payload.role,
    staff: {
      MSNV: staff.MSNV,
      HoTenNV: staff.HoTenNV,
      ChucVu: staff.ChucVu,
    },
  };
}

function buildReaderTokens(reader) {
  const payload = {
    role: "reader",
    _id: reader._id,
    MaDocGia: reader.MaDocGia,
  };

  return {
    accessToken: token.generateAccessToken(payload),
    refreshToken: token.generateRefreshToken({
      role: payload.role,
      accountId: payload.MaDocGia,
      MaDocGia: payload.MaDocGia,
    }),
    role: payload.role,
    reader: {
      MaDocGia: reader.MaDocGia,
      HoLot: reader.HoLot,
      Ten: reader.Ten,
      NgaySinh: reader.NgaySinh,
      Phai: reader.Phai,
      DiaChi: reader.DiaChi,
      DienThoai: reader.DienThoai,
    },
  };
}

exports.login = async ({ MSNV, MaDocGia, Password, accountId, username }) => {
  const loginId = MSNV || MaDocGia || accountId || username;

  if (!loginId || !Password) {
    throw { status: 400, message: "Thiếu thông tin đăng nhập" };
  }

  const staff = await Staff.findOne({ MSNV: loginId });
  if (staff) {
    const isMatch = await staff.comparePassword(Password);
    if (!isMatch) {
      throw { status: 401, message: "Sai tài khoản hoặc mật khẩu" };
    }

    const tokens = buildStaffTokens(staff);

    await RefreshToken.create({
      token: tokens.refreshToken,
      accountId: staff.MSNV,
      role: tokens.role,
      MSNV: staff.MSNV,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
    });

    return tokens;
  }

  const reader = await Reader.findOne({ MaDocGia: loginId });
  if (reader) {
    const isMatch = await reader.comparePassword(Password);
    if (!isMatch) {
      throw { status: 401, message: "Sai tài khoản hoặc mật khẩu" };
    }

    const tokens = buildReaderTokens(reader);

    await RefreshToken.create({
      token: tokens.refreshToken,
      accountId: reader.MaDocGia,
      role: tokens.role,
      MaDocGia: reader.MaDocGia,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
    });

    return tokens;
  }

  throw { status: 401, message: "Sai tài khoản hoặc mật khẩu" };
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
  const role = decoded.role || (decoded.MSNV ? "staff" : "reader");
  const accountId =
    decoded.accountId ||
    decoded.MSNV ||
    decoded.MaDocGia ||
    storedToken.accountId;

  const accessPayload =
    role === "staff"
      ? {
          role,
          MSNV: decoded.MSNV || accountId,
          ChucVu: decoded.ChucVu || null,
        }
      : {
          role,
          _id: decoded._id,
          MaDocGia: decoded.MaDocGia || accountId,
        };

  const accessToken = token.generateAccessToken(accessPayload);
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
