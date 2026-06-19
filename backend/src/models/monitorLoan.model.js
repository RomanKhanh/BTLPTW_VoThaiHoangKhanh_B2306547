const mongoose = require("mongoose");

const MonitorLoanSchema = new mongoose.Schema(
  {
    MaDocGia: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reader",
      required: true,
    },
    MaSach: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    NgayMuon: {
      type: Date,
      required: true,
      default: Date.now,
    },
    NgayHenTra: {
      type: Date,
      required: true, // hạn phải trả sách, dùng để tính quá hạn
    },
    NgayTra: {
      type: Date,
      default: null, // null = chưa trả, có giá trị = ngày trả thực tế
    },
    PhuongThucNhan: {
      type: String,
      enum: ["GiaoHang", "NhanTrucTiep"],
      default: "NhanTrucTiep",
    },
  },
  {
    timestamps: true,
    collection: "MonitorLoan",
  },
);

// Compound index: mỗi độc giả chỉ mượn 1 cuốn sách tại 1 thời điểm
MonitorLoanSchema.index(
  { MaDocGia: 1, MaSach: 1, NgayMuon: 1 },
  { unique: true },
);

module.exports = mongoose.model("MonitorLoan", MonitorLoanSchema);
