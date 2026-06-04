const express = require("express");

const readers = require("../controllers/reader.controller");

const router = express.Router();

router.route("/").get(readers.getReaders).post(readers.createReader);

router
  .route("/:id")
  .get(readers.getReaderById)
  .put(readers.updateReader)
  .delete(readers.deleteReader);

module.exports = router;
