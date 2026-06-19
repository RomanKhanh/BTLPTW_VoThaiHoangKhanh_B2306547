const express = require("express");
const router = express.Router();
const staffController = require("../controllers/staff.controller");
const { requireRoles } = require("../middleware/auth");

router.use(requireRoles("staff"));

router.post("/", staffController.createStaff);
router.get("/", staffController.getAllStaff);
router.get("/:MSNV", staffController.getStaffByMSNV);
router.patch("/:MSNV", staffController.updateStaff);
router.patch("/:MSNV/change-password", staffController.changePassword);

module.exports = router;
