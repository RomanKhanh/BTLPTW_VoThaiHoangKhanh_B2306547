const monitorLoanService = require("../services/monitorLoan.service");

exports.createMonitorLoan = async (req, res, next) => {
  try {
    const monitorLoanData = req.body;
    const newMonitorLoan =
      await monitorLoanService.createMonitorLoan(monitorLoanData);
    res.status(201).json({ success: true, data: newMonitorLoan });
  } catch (err) {
    next(err);
  }
};

exports.getMonitorLoan = async (req, res, next) => {
  try {
    const { MaDocGia, MaSach, NgayTra, returned } = req.query;
    const filter = {};

    if (MaDocGia) {
      filter.MaDocGia = MaDocGia;
    }
    if (MaSach) {
      filter.MaSach = MaSach;
    }
    if (returned === "true") {
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

      end.setDate(end.getDate() + 1);

      filter.NgayTra = {
        $gte: start,
        $lt: end,
      };
    } else if (NgayTra === "null") {
      filter.NgayTra = null;
    }
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
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};
