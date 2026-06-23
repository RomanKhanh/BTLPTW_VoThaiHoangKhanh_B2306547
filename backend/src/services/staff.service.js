const { Staff, Counter } = require("../models/");
const bcrypt = require("bcrypt");

async function getNextStaffCode() {
  const counter = await Counter.findByIdAndUpdate(
    "staff",
    { $inc: { seq: 1 } },
    {
      new: true,
      returnDocument: "after",
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

exports.getAllStaff = async (filter = {}, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const [staffList, total] = await Promise.all([
    Staff.find(filter).skip(skip).limit(limit).select("-Password"),
    Staff.countDocuments(filter),
  ]);

  return {
    data: staffList.map((staff) => ({
      MSNV: staff.MSNV,
      HoTenNV: staff.HoTenNV,
      ChucVu: staff.ChucVu,
      DiaChi: staff.DiaChi,
      SoDienThoai: staff.SoDienThoai,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
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
  delete data.Password;

  const staff = await Staff.findOneAndUpdate({ MSNV }, data, {
    new: true,
    returnDocument: "after",
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

exports.changePassword = async (MSNV, oldPassword, newPassword) => {
  const staff = await Staff.findOne({ MSNV });
  if (!staff) {
    throw {
      status: 400,
      message: "Nhân viên không tồn tại",
    };
  }
  const isMatch = await bcrypt.compare(oldPassword, staff.Password);

  if (!isMatch) {
    throw {
      status: 400,
      message: "Mật khẩu hiện tại không đúng",
    };
  }
  staff.Password = newPassword;
  await staff.save();
  return {
    message: "Đổi mật khẩu thành công",
  };
};
