const mongoose = require("mongoose");

const RefreshTokenSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, unique: true },
    accountId: { type: String, required: true },
    role: { type: String, enum: ["staff", "reader"], required: true },
    MSNV: { type: String, default: null },
    MaDocGia: { type: String, default: null },
    expiresAt: { type: Date, required: true },
    // Tự xóa document khi hết hạn (MongoDB TTL index)
  },
  { timestamps: true },
);

RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("RefreshToken", RefreshTokenSchema);
