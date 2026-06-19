const express = require("express");
const router = express.Router();
const staffController = require("../controllers/staff.controller");
const {
  requireRoles,
  requireManager,
  requireSelfOrManager,
} = require("../middleware/auth");

router.use(requireRoles("staff"));

router.post("/", requireManager, staffController.createStaff);
router.get("/", requireManager, staffController.getAllStaff);
router.get(
  "/:MSNV",
  requireSelfOrManager("MSNV", "MSNV"),
  staffController.getStaffByMSNV,
);
router.patch(
  "/:MSNV",
  requireSelfOrManager("MSNV", "MSNV"),
  staffController.updateStaff,
);
router.patch(
  "/:MSNV/change-password",
  requireSelfOrManager("MSNV", "MSNV"),
  staffController.changePassword,
);

module.exports = router;
