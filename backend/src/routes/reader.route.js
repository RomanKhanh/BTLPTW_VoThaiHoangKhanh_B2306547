const readerController = require("../controllers/reader.controller");
const express = require("express");
const router = express.Router();

router.post("/", readerController.createReader);
router.get("/", readerController.getReaders);
router.get("/:MaDocGia", readerController.getReaderByMaDocGia);
router.patch("/:MaDocGia", readerController.updateReader);
router.delete("/:MaDocGia", readerController.deleteReader);

module.exports = router;
