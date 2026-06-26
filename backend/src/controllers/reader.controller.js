const readerService = require("../services/reader.service");

exports.createReader = async (req, res, next) => {
  if (!Object.keys(req.body).length) {
    return next({
      status: 400,
      message: "Không có dữ liệu tạo độc giả",
    });
  }

  try {
    const readerData = req.body;
    const newReader = await readerService.createReader(readerData);
    res.status(201).json({ success: true, data: newReader });
  } catch (err) {
    next(err);
  }
};

exports.getReaderByMaDocGia = async (req, res, next) => {
  try {
    const { MaDocGia } = req.params;
    const reader = await readerService.getReaderByMaDocGia(MaDocGia);
    res.status(200).json({ success: true, data: reader });
  } catch (err) {
    next(err);
  }
};

exports.getReaders = async (req, res, next) => {
  try {
    const {
      HoLot,
      Ten,
      DiaChi,
      Phai,
      NgaySinh,
      DienThoai,
      search,
      isActive,
      page,
      limit,
    } = req.query;
    const filter = {};
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;

    // Lọc theo trạng thái active nếu được truyền vào
    if (isActive !== undefined) {
      filter.isActive = isActive === "true" || isActive === true;
    }

    if (HoLot) {
      filter.HoLot = {
        $regex: HoLot,
        $options: "i",
      };
    }

    if (Ten) {
      filter.Ten = {
        $regex: Ten,
        $options: "i",
      };
    }

    if (DiaChi) {
      filter.DiaChi = {
        $regex: DiaChi,
        $options: "i",
      };
    }

    if (Phai) {
      filter.Phai = {
        $regex: `^${Phai}$`,
        $options: "i",
      };
    }

    if (NgaySinh) {
      filter.NgaySinh = new Date(NgaySinh);
    }

    if (DienThoai) {
      filter.DienThoai = DienThoai;
    }

    if (search) {
      filter.$or = [
        { MaDocGia: { $regex: search, $options: "i" } },
        { HoLot: { $regex: search, $options: "i" } },
        { Ten: { $regex: search, $options: "i" } },
      ];
    }

    const readers = await readerService.getReadersByfilter(
      filter,
      pageNum,
      limitNum,
    );
    res.status(200).json({
      success: true,
      data: readers.data,
      pagination: readers.pagination,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateReader = async (req, res, next) => {
  if (!Object.keys(req.body).length) {
    return next({
      status: 400,
      message: "Không có dữ liệu cập nhật",
    });
  }

  try {
    const result = await readerService.updateReader(
      req.params.MaDocGia,
      req.body,
    );
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { MaDocGia } = req.params;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return next({
        status: 400,
        message: "Thiếu oldPassword hoặc newPassword",
      });
    }

    if (req.user?.role === "reader" && req.user.MaDocGia !== MaDocGia) {
      return next({
        status: 403,
        message: "Bạn chỉ có thể đổi mật khẩu của chính mình",
      });
    }

    const result = await readerService.changePassword(
      MaDocGia,
      oldPassword,
      newPassword,
    );

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { MaDocGia } = req.params;
    const { newPassword } = req.body;
    if (!newPassword) {
      return next({ status: 400, message: "Thiếu newPassword" });
    }
    const result = await readerService.resetPasswordByStaff(
      MaDocGia,
      newPassword,
    );
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

exports.activateReader = async (req, res, next) => {
  try {
    const { MaDocGia } = req.params;
    const { isActive } = req.body;
    if (typeof isActive !== "boolean") {
      return next({ status: 400, message: "isActive phải là boolean" });
    }
    const result = await readerService.activateReader(MaDocGia, isActive);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

exports.deleteReader = async (req, res, next) => {
  try {
    const { MaDocGia } = req.params;
    await readerService.deleteReader(MaDocGia);
    return res
      .status(200)
      .json({ success: true, message: "Xóa độc giả thành công" });
  } catch (error) {
    next(error);
  }
};
