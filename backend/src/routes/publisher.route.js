const publisherController = require("../controllers/publisher.controller");
const express = require("express");
const router = express.Router();

router.get("/", publisherController.getAllPublishers);
router.post("/", publisherController.createPublisher);
router.get("/MaNXB/:MaNXB", publisherController.getPublisherByMaNXB);
router.get("/TenNXB/:TenNXB", publisherController.getPublisherByTenNXB);
router.patch("/MaNXB/:MaNXB", publisherController.updatePublisher);
router.delete("/MaNXB/:MaNXB", publisherController.deletePublisher);

module.exports = router;
