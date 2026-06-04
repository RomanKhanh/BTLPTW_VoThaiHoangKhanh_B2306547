const mongoose = require("mongoose");

const ReaderSchema = new mongoose.Schema(
  {
    MaDocGia: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    HoLot: {
      type: String,
      required: true,
      trim: true,
    },
    Ten: {
      type: String,
      required: true,
      trim: true,
    },
    NgaySinh: {
      type: Date,
      default: null,
    },
    Phai: {
      type: String,
      enum: ["Nam", "Nữ", "Khác"],
      default: null,
    },
    DiaChi: {
      type: String,
      trim: true,
      default: null,
    },
    DienThoai: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "docgia",
  },
);

module.exports = mongoose.model("Reader", ReaderSchema);
