const publisherController = require("../controllers/publisher.controller");
const express = require("express");
const router = express.Router();
const { requireRoles } = require("../middleware/auth");

router.get("/", publisherController.getAllPublishers);
router.post("/", requireRoles("staff"), publisherController.createPublisher);
router.get("/MaNXB/:MaNXB", publisherController.getPublisherByMaNXB);
router.get("/TenNXB/:TenNXB", publisherController.getPublisherByTenNXB);
router.patch(
  "/MaNXB/:MaNXB",
  requireRoles("staff"),
  publisherController.updatePublisher,
);
router.delete(
  "/MaNXB/:MaNXB",
  requireRoles("staff"),
  publisherController.deletePublisher,
);

module.exports = router;
