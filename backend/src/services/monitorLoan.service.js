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

  await Book.findOneAndUpdate(
    { MaSach: data.MaSach },
    { $inc: { SoLuong: -1 } },
  );

  return loan;
};
