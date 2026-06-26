const errorHandler = (err, req, res, next) => {
  // Lỗi tự throw
  if (err.status) {
    return res.status(err.status).json({
      success: false,
      code: err.code,
      message: err.message,
    });
  }

  // JWT hết hạn
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token hết hạn",
    });
  }

  // JWT sai
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Token không hợp lệ",
    });
  }

  // Các Error khác
  if (err instanceof Error) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  console.error(err);

  return res.status(500).json({
    success: false,
    message: "Lỗi server",
  });
};

module.exports = errorHandler;
