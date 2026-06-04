const mongoose = require("mongoose");

const PublisherSchema = new mongoose.Schema(
  {
    MaNXB: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    TenNXB: {
      type: String,
      required: true,
      trim: true,
    },
    DiaChi: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "nhaxuatban",
  },
);

module.exports = mongoose.model("Publisher", PublisherSchema);
