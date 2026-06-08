const monitorLoanController = require("../controllers/monitorLoan.controller");
const express = require("express");
const router = express.Router();

router.post("/", monitorLoanController.createMonitorLoan);

module.exports = router;
