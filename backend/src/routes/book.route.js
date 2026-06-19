const bookController = require("../controllers/book.controller");
const express = require("express");
const router = express.Router();
const { requireRoles } = require("../middleware/auth");

router.get("/", bookController.getBooks);
router.get("/:MaSach", bookController.getBookByMaSach);
router.post("/", requireRoles("staff"), bookController.createBook);
router.patch("/:MaSach", requireRoles("staff"), bookController.updateBook);
router.delete("/:MaSach", requireRoles("staff"), bookController.deleteBook);

module.exports = router;
