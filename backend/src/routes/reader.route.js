const readerController = require("../controllers/reader.controller");
const express = require("express");
const router = express.Router();
const { requireRoles, requireSelfOrStaff } = require("../middleware/auth");

router.post(
  "/",
  requireRoles("reader", "staff"),
  readerController.createReader,
);
router.get("/", requireRoles("staff"), readerController.getReaders);
router.get(
  "/:MaDocGia",
  requireRoles("staff"),
  readerController.getReaderByMaDocGia,
);
router.patch(
  "/:MaDocGia",
  requireSelfOrStaff("MaDocGia"),
  readerController.updateReader,
);
router.patch(
  "/:MaDocGia/change-password",
  requireSelfOrStaff("MaDocGia"),
  readerController.changePassword,
);
router.delete(
  "/:MaDocGia",
  requireRoles("staff"),
  readerController.deleteReader,
);

module.exports = router;
