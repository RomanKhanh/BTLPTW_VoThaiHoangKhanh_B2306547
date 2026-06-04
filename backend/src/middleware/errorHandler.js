const errorHandler = (err, req, res, next) => {
  // Lỗi từ service throw thủ công
  if (err.status) {
    return res
      .status(err.status)
      .json({ success: false, message: err.message });
  }

  // Lỗi từ jwt.verify() hết hạn
  if (err.name === "TokenExpiredError") {
    return res.status(403).json({ success: false, message: "Token hết hạn" });
  }

  // Lỗi không xác định
  console.error(err);
  res.status(500).json({ success: false, message: "Lỗi server" });
};

module.exports = errorHandler;
