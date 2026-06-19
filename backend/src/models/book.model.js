const mongoose = require("mongoose");

const BookSchema = new mongoose.Schema(
  {
    MaSach: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    TenSach: {
      type: String,
      required: true,
      trim: true,
    },
    DonGia: {
      type: Number,
      required: true,
      min: 0,
    },
    SoQuyen: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    NamXuatBan: {
      type: Number,
      min: 1000,
      max: 9999,
      default: null,
    },
    MaNXB: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Publisher",
      required: true,
    },
    NguonGocTacGia: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "Book",
  },
);

module.exports = mongoose.model("Book", BookSchema);
