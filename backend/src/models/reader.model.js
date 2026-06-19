const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

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
    Password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "Reader",
  },
);

ReaderSchema.pre("save", async function () {
  if (!this.isModified("Password")) return;

  const salt = await bcrypt.genSalt(10);
  this.Password = await bcrypt.hash(this.Password, salt);
});

ReaderSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.Password);
};

module.exports = mongoose.model("Reader", ReaderSchema);
