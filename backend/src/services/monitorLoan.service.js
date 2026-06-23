const { MonitorLoan, Reader, Book } = require("../models/");

const MAX_LOAN_DAYS = 21; // tối đa 3 tuần
const DEFAULT_LOAN_DAYS = 14; // mặc định khi staff tạo phiếu không nhập hạn trả

async function resolveReader(MaDocGia) {
  let reader = await Reader.findOne({ MaDocGia });
  if (!reader && Reader.db.base.Types.ObjectId.isValid(MaDocGia)) {
    reader = await Reader.findById(MaDocGia);
  }
  if (!reader) {
    throw { status: 404, message: "Độc giả không tồn tại" };
  }
  return reader;
}

async function resolveBook(MaSach) {
  let book = await Book.findOne({ MaSach });
  if (!book && Book.db.base.Types.ObjectId.isValid(MaSach)) {
    book = await Book.findById(MaSach);
  }
  if (!book) {
    throw { status: 404, message: "Sách không tồn tại" };
  }
  return book;
}

exports.createMonitorLoan = async (data) => {
  const reader = await resolveReader(data.MaDocGia);
  const book = await resolveBook(data.MaSach);

  if (book.SoQuyen < 1) {
    throw { status: 400, message: "Sách đã hết, không thể mượn" };
  }

  const borrowed = await MonitorLoan.findOne({
    MaDocGia: reader._id,
    MaSach: book._id,
    NgayTra: null,
  });

  if (borrowed) {
    throw {
      status: 400,
      message: "Độc giả đang mượn cuốn sách này, chưa trả",
    };
  }

  const NgayMuon = new Date();

  let NgayHenTra = data.NgayHenTra ? new Date(data.NgayHenTra) : null;
  if (!NgayHenTra || isNaN(NgayHenTra.getTime())) {
    NgayHenTra = new Date(NgayMuon);
    NgayHenTra.setDate(NgayHenTra.getDate() + DEFAULT_LOAN_DAYS);
  }

  const maxDate = new Date(NgayMuon);
  maxDate.setDate(maxDate.getDate() + MAX_LOAN_DAYS);

  if (NgayHenTra <= NgayMuon) {
    throw { status: 400, message: "Ngày hẹn trả phải sau ngày mượn" };
  }
  if (NgayHenTra > maxDate) {
    throw {
      status: 400,
      message: `Ngày hẹn trả không được vượt quá ${MAX_LOAN_DAYS} ngày kể từ ngày mượn`,
    };
  }

  const PhuongThucNhan =
    data.PhuongThucNhan === "GiaoHang" ? "GiaoHang" : "NhanTrucTiep";

  const loan = await MonitorLoan.create({
    MaDocGia: reader._id,
    MaSach: book._id,
    NgayMuon,
    NgayHenTra,
    NgayTra: null,
    PhuongThucNhan,
  });

  await Book.findOneAndUpdate({ _id: book._id }, { $inc: { SoQuyen: -1 } });

  return MonitorLoan.findById(loan._id)
    .populate("MaDocGia", "MaDocGia HoLot Ten")
    .populate("MaSach", "MaSach TenSach");
};

exports.getMonitorLoanByFilter = async (filter = {}, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const [loanRecords, total] = await Promise.all([
    MonitorLoan.find(filter)
      .sort({ NgayMuon: -1 })
      .skip(skip)
      .limit(limit)
      .populate("MaDocGia", "MaDocGia HoLot Ten")
      .populate("MaSach", "MaSach TenSach"),
    MonitorLoan.countDocuments(filter),
  ]);

  return {
    data: loanRecords,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
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

  return MonitorLoan.findById(loanRecord._id)
    .populate("MaDocGia", "MaDocGia HoLot Ten")
    .populate("MaSach", "MaSach TenSach");
};
