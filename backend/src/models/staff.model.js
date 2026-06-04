const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const StaffSchema = new mongoose.Schema(
  {
    MSNV: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    HoTenNV: {
      type: String,
      required: true,
      trim: true,
    },
    Password: {
      type: String,
      required: true,
    },
    ChucVu: {
      type: String,
      trim: true,
      default: null,
    },
    DiaChi: {
      type: String,
      trim: true,
      default: null,
    },
    SoDienThoai: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "nhanvien",
  },
);

// Hash password trước khi lưu
StaffSchema.pre("save", async function (next) {
  if (!this.isModified("Password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.Password = await bcrypt.hash(this.Password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method kiểm tra password
StaffSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.Password);
};

module.exports = mongoose.model("Staff", StaffSchema);
