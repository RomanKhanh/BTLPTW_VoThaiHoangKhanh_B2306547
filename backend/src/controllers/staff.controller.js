const staffService = require("../services/staff.service");

exports.createStaff = async (req, res, next) => {
  if (!Object.keys(req.body).length) {
    return next({
      status: 400,
      message: "Không có dữ liệu cập nhật",
    });
  }
  try {
    const result = await staffService.createStaff(req.body);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

exports.getAllStaff = async (req, res, next) => {
  try {
    const { search, page, limit } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const filter = {};

    if (search) {
      filter.$or = [
        { MSNV: { $regex: search, $options: "i" } },
        { HoTenNV: { $regex: search, $options: "i" } },
      ];
    }

    const result = await staffService.getAllStaff(filter, pageNum, limitNum);
    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (err) {
    next(err);
  }
};

exports.getStaffByMSNV = async (req, res, next) => {
  try {
    const result = await staffService.getStaffByMSNV(req.params.MSNV);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const { isManager } = require("../middleware/auth");

exports.updateStaff = async (req, res, next) => {
  if (!Object.keys(req.body).length) {
    return next({ status: 400, message: "Không có dữ liệu cập nhật" });
  }
  try {
    const payload = { ...req.body };
    if (!isManager(req.user?.ChucVu)) {
      delete payload.ChucVu; // chỉ Quản lý mới đổi được Chức vụ
    }
    const result = await staffService.updateStaff(req.params.MSNV, payload);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { MSNV } = req.params;
    const { oldPassword, newPassword } = req.body;
    const result = await staffService.changePassword(
      MSNV,
      oldPassword,
      newPassword,
    );
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};
