const { MonitorLoan, Reader, Book } = require("../models/");

exports.createMonitorLoan = async (data) => {
  const reader = await Reader.findById(data.MaDocGia);
  if (!reader) {
    throw { status: 404, message: "Độc giả không tồn tại" };
  }
  const book = await Book.findById(data.MaSach);
  if (!book) {
    throw { status: 404, message: "Sách không tồn tại" };
  }
  if (book.SoLuong < 1) {
    throw { status: 400, message: "Sách đã hết hàng" };
  }
  const borrowed = await MonitorLoan.findOne({
    MaDocGia: data.MaDocGia,
    MaSach: data.MaSach,
    NgayTra: null,
  });

  if (borrowed) {
    throw {
      status: 400,
      message: "Độc giả đang mượn cuốn sách này",
    };
  }
  data = { NgayMuon: new Date(), NgayTra: null, ...data };
  const loan = await MonitorLoan.create(data);

  await Book.findOneAndUpdate({ _id: data.MaSach }, { $inc: { SoQuyen: -1 } });

  return loan;
};

exports.getMonitorLoanByFilter = async (filter = {}) => {
  return await MonitorLoan.find(filter)
    .populate("MaDocGia", "MaDocGia HoLot Ten")
    .populate("MaSach", "MaSach TenSach");
};

exports.getMonitorLoanByIdDocGia = async (idDG) => {
  return await this.getMonitorLoanByFilter({ MaDocGia: idDG });
};

exports.updateNgayTra = async (id) => {
  let loanRecord = await MonitorLoan.findById(id);

  if (!loanRecord) {
    throw {
      status: 400,
      message: "Mã id của phiếu không tồn tại",
    };
  }
  if (loanRecord.NgayTra) {
    throw {
      status: 400,
      message: "Sách đã được trả",
    };
  }

  await Book.findOneAndUpdate(
    { _id: loanRecord.MaSach },
    { $inc: { SoQuyen: 1 } },
  );

  loanRecord.NgayTra = new Date();
  await loanRecord.save();

  return loanRecord;
};
