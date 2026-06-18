const monitorLoanController = require("../controllers/monitorLoan.controller");
const express = require("express");
const router = express.Router();
const { requireRoles, requireSelfOrStaff } = require("../middleware/auth");

router.get("/", requireRoles("staff"), monitorLoanController.getMonitorLoan);
router.get(
  "/:idDG",
  requireSelfOrStaff("idDG", "_id"),
  monitorLoanController.getMonitorLoanByIdDocGia,
);
router.post(
  "/",
  requireRoles("staff"),
  monitorLoanController.createMonitorLoan,
);
router.patch(
  "/:id",
  requireRoles("staff"),
  monitorLoanController.updateNgayTra,
);

module.exports = router;
