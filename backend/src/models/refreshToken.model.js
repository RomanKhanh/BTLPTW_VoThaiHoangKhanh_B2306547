const mongoose = require("mongoose");

const RefreshTokenSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, unique: true },
    MSNV: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    // Tự xóa document khi hết hạn (MongoDB TTL index)
  },
  { timestamps: true },
);

RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("RefreshToken", RefreshTokenSchema);
