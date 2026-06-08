const monitorLoanService = require("../services/monitorLoan.service");

exports.createMonitorLoan = async (req, res, next) => {
  try {
    const monitorLoanData = req.body;
    const newMonitorLoan =
      await monitorLoanService.createMonitorLoan(monitorLoanData);
    res.status(201).json({ success: true, data: newMonitorLoan });
  } catch (err) {
    next(err);
  }
};
