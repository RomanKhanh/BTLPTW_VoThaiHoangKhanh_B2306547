const monitorLoanService = require("../services/monitorLoan.service");
const readerService = require("../services/reader.service");

exports.createMonitorLoan = async (req, res, next) => {
  try {
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

    const newMonitorLoan =
      await monitorLoanService.createMonitorLoan(monitorLoanData);
    res.status(201).json({ success: true, data: newMonitorLoan });
  } catch (err) {
    next(err);
  }
};

exports.getMonitorLoan = async (req, res, next) => {
  try {
    const {
      MaDocGia,
      MaSach,
      NgayTra,
      NgayMuon,
      returned,
      quaHan,
      page,
      limit,
    } = req.query;
    const filter = {};
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;

    if (MaDocGia) {
      const idDG = await readerService.getReaderByMaDocGia(MaDocGia);
      filter.MaDocGia = idDG;
    }
    if (MaSach) {
      filter.MaSach = MaSach;
    }

    if (quaHan === "true") {
      filter.NgayTra = null;
      filter.NgayHenTra = { $lt: new Date() };
    } else if (returned === "true") {
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

    const loanRecords = await monitorLoanService.getMonitorLoanByFilter(
      filter,
      pageNum,
      limitNum,
    );
    res.status(200).json({
      success: true,
      data: loanRecords.data,
      pagination: loanRecords.pagination,
    });
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
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};
