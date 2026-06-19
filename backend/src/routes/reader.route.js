const readerController = require("../controllers/reader.controller");
const express = require("express");
const router = express.Router();
const { requireRoles, requireSelfOrStaff } = require("../middleware/auth");

// Đăng ký công khai cho reader (không cần đăng nhập) - whitelist trong middleware/auth.js
router.post("/", readerController.createReader);
router.get("/", requireRoles("staff"), readerController.getReaders);
router.get(
  "/:MaDocGia",
  requireSelfOrStaff("MaDocGia", "MaDocGia"),
  readerController.getReaderByMaDocGia,
);
router.patch(
  "/:MaDocGia",
  requireSelfOrStaff("MaDocGia", "MaDocGia"),
  readerController.updateReader,
);
router.patch(
  "/:MaDocGia/change-password",
  requireSelfOrStaff("MaDocGia", "MaDocGia"),
  readerController.changePassword,
);
router.patch(
  "/:MaDocGia/reset-password",
  requireRoles("staff"),
  readerController.resetPassword,
);
router.delete(
  "/:MaDocGia",
  requireRoles("staff"),
  readerController.deleteReader,
);

module.exports = router;
