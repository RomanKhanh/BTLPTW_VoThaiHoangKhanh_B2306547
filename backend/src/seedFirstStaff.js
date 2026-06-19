/**
 * Script tạo tài khoản staff đầu tiên (bootstrap), chạy 1 lần khi setup hệ thống.
 * Vì POST /api/staff yêu cầu đăng nhập với vai trò staff, cần 1 cách tạo tài khoản
 * staff đầu tiên trực tiếp qua DB.
 *
 * Cách dùng:
 *   node src/seedFirstStaff.js
 *
 * Có thể truyền thông tin qua biến môi trường, ví dụ:
 *   SEED_MSNV=NV001 SEED_PASSWORD=123456 SEED_HOTEN="Quan Tri Vien" node src/seedFirstStaff.js
 */
require("dotenv").config();
const connection = require("./config/database");
const { Staff } = require("./models");

(async () => {
  try {
    await connection();

    const MSNV = process.env.SEED_MSNV || "NV001";
    const Password = process.env.SEED_PASSWORD || "123456";
    const HoTenNV = process.env.SEED_HOTEN || "Quản trị viên";
    const ChucVu = process.env.SEED_CHUCVU || "Quản lý";

    const existing = await Staff.findOne({ MSNV });
    if (existing) {
      console.log(`Tài khoản staff ${MSNV} đã tồn tại, không tạo lại.`);
      process.exit(0);
    }

    const staff = await Staff.create({ MSNV, Password, HoTenNV, ChucVu });
    console.log("Tạo tài khoản staff đầu tiên thành công:");
    console.log({ MSNV: staff.MSNV, HoTenNV: staff.HoTenNV, Password });
    process.exit(0);
  } catch (err) {
    console.error("Lỗi khi tạo staff đầu tiên:", err);
    process.exit(1);
  }
})();
