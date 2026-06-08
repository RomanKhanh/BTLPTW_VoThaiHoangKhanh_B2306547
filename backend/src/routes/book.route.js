const bookController = require("../controllers/book.controller");
const express = require("express");
const router = express.Router();

router.get("/", bookController.getBooks);
router.get("/:MaSach", bookController.getBookByMaSach);
router.post("/", bookController.createBook);
router.patch("/:MaSach", bookController.updateBook);
router.delete("/:MaSach", bookController.deleteBook);

module.exports = router;
