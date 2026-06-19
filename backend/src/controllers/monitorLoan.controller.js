const monitorLoanService = require("../services/monitorLoan.service");

exports.createMonitorLoan = async (req, res, next) => {
  try {
<<<<<<< HEAD
    const monitorLoanData = { ...req.body };

    // Reader chỉ được tự mượn cho chính mình, không được mượn hộ người khác
    if (req.userRole === "reader") {
      monitorLoanData.MaDocGia = req.user.MaDocGia;
      if (!monitorLoanData.PhuongThucNhan) {
        throw {
          status: 400,
          message: "Vui lòng chọn phương thức nhận sách",
        };
      }
    }

    if (!monitorLoanData.MaDocGia || !monitorLoanData.MaSach) {
      throw {
        status: 400,
        message: "Thiếu mã độc giả hoặc mã sách",
      };
    }

=======
    const monitorLoanData = req.body;
>>>>>>> 128f6133a0c05ad620a1b07ee3edc6c841ff138b
    const newMonitorLoan =
      await monitorLoanService.createMonitorLoan(monitorLoanData);
    res.status(201).json({ success: true, data: newMonitorLoan });
  } catch (err) {
    next(err);
  }
};

exports.getMonitorLoan = async (req, res, next) => {
  try {
<<<<<<< HEAD
    const { MaDocGia, MaSach, NgayTra, NgayMuon, returned, quaHan } =
      req.query;
=======
    const { MaDocGia, MaSach, NgayTra, returned } = req.query;
>>>>>>> 128f6133a0c05ad620a1b07ee3edc6c841ff138b
    const filter = {};

    if (MaDocGia) {
      filter.MaDocGia = MaDocGia;
    }
    if (MaSach) {
      filter.MaSach = MaSach;
    }
<<<<<<< HEAD

    if (quaHan === "true") {
      filter.NgayTra = null;
      filter.NgayHenTra = { $lt: new Date() };
    } else if (returned === "true") {
=======
    if (returned === "true") {
>>>>>>> 128f6133a0c05ad620a1b07ee3edc6c841ff138b
      filter.NgayTra = { $ne: null };
    } else if (returned === "false") {
      filter.NgayTra = null;
    } else if (NgayTra && NgayTra !== "null") {
      const start = new Date(NgayTra);

      if (isNaN(start.getTime())) {
        throw {
          status: 400,
          message: "Ngày trả không hợp lệ",
        };
      }

      const end = new Date(NgayTra);
<<<<<<< HEAD
=======

>>>>>>> 128f6133a0c05ad620a1b07ee3edc6c841ff138b
      end.setDate(end.getDate() + 1);

      filter.NgayTra = {
        $gte: start,
        $lt: end,
      };
    } else if (NgayTra === "null") {
      filter.NgayTra = null;
    }
<<<<<<< HEAD

    if (NgayMuon) {
      const start = new Date(NgayMuon);
      if (isNaN(start.getTime())) {
        throw {
          status: 400,
          message: "Ngày mượn không hợp lệ",
        };
      }
      const end = new Date(NgayMuon);
      end.setDate(end.getDate() + 1);

      filter.NgayMuon = {
        $gte: start,
        $lt: end,
      };
    }

=======
>>>>>>> 128f6133a0c05ad620a1b07ee3edc6c841ff138b
    const loanRecords = await monitorLoanService.getMonitorLoanByFilter(filter);
    res.status(200).json({ success: true, data: loanRecords });
  } catch (err) {
    next(err);
  }
};

exports.getMonitorLoanByIdDocGia = async (req, res, next) => {
  try {
    const { idDG } = req.params;
    const loanRecords = await monitorLoanService.getMonitorLoanByIdDocGia(idDG);
    res.status(200).json({ success: true, data: loanRecords });
  } catch (err) {
    next(err);
  }
};

exports.updateNgayTra = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await monitorLoanService.updateNgayTra(id);
<<<<<<< HEAD
    res.status(200).json({ success: true, data: result });
=======
    res.status(201).json({ success: true, data: result });
>>>>>>> 128f6133a0c05ad620a1b07ee3edc6c841ff138b
  } catch (err) {
    next(err);
  }
};
