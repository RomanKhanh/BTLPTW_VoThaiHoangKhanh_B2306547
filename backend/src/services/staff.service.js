const { Staff } = require("../models/");

exports.createStaff = async (data) => {
  const existingStaff = await Staff.findOne({ MSNV: data.MSNV });
  if (existingStaff) {
    throw { status: 400, message: "MSNV đã tồn tại" };
  }
  const staff = await Staff.create(data);
  return {
    MSNV: staff.MSNV,
    HoTenNV: staff.HoTenNV,
    ChucVu: staff.ChucVu,
    DiaChi: staff.DiaChi,
    SoDienThoai: staff.SoDienThoai,
  };
};

exports.getAllStaff = async () => {
  const staffList = await Staff.find();
  return staffList.map((staff) => ({
    MSNV: staff.MSNV,
    HoTenNV: staff.HoTenNV,
    ChucVu: staff.ChucVu,
    DiaChi: staff.DiaChi,
    SoDienThoai: staff.SoDienThoai,
  }));
};

exports.getStaffByMSNV = async (MSNV) => {
  const staff = await Staff.findOne({ MSNV });
  if (!staff) {
    throw { status: 404, message: "Nhân viên không tồn tại" };
  }
  return {
    MSNV: staff.MSNV,
    HoTenNV: staff.HoTenNV,
    ChucVu: staff.ChucVu,
    DiaChi: staff.DiaChi,
    SoDienThoai: staff.SoDienThoai,
  };
};

exports.updateStaff = async (MSNV, data) => {
  const staff = await Staff.findOneAndUpdate({ MSNV }, data, {
    new: true,
    runValidators: true,
  }).select("-Password");
  if (!staff) {
    throw {
      status: 404,
      message: "Nhân viên không tồn tại",
    };
  }
  return {
    MSNV: staff.MSNV,
    HoTenNV: staff.HoTenNV,
    ChucVu: staff.ChucVu,
    DiaChi: staff.DiaChi,
    SoDienThoai: staff.SoDienThoai,
  };
};
