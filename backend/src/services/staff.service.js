const { Staff, Counter } = require("../models/");

async function getNextStaffCode() {
  const counter = await Counter.findByIdAndUpdate(
    "staff",
    { $inc: { seq: 1 } },
    {
      new: true,
      upsert: true,
    },
  );

  return `NV${String(counter.seq).padStart(3, "0")}`;
}

exports.createStaff = async (data) => {
  data.MSNV = await getNextStaffCode();

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
  delete data.MSNV;

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
