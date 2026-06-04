const ReaderService = require("../services/reader.service");
const ApiError = require("../api-error");

exports.createReader = async (req, res, next) => {
  if (!req.body) {
    return next(new ApiError(400, "Content can not be empty"));
  }
  try {
    const readerService = new ReaderService();
    const result = await readerService.createReader(req.body);
    return res.status(200).json(result);
  } catch (error) {
    console.log("Error creating reader", error);
    return next(new ApiError(500, "Error creating reader"));
  }
};

exports.getReaders = (req, res) => {
  res.send("Get all readers");
};
exports.getReaderById = (req, res) => {
  res.send("Get reader by id");
};

exports.updateReader = (req, res) => {
  res.send("Update reader");
};

exports.deleteReader = (req, res) => {
  res.send("Delete reader");
};
