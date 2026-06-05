const express = require("express");
const router = express.Router();
const staffController = require("../controllers/staff.controller");

router.post("/", staffController.createStaff);
router.get("/", staffController.getAllStaff);
router.get("/:MSNV", staffController.getStaffByMSNV);
router.patch("/:MSNV", staffController.updateStaff);

module.exports = router;
