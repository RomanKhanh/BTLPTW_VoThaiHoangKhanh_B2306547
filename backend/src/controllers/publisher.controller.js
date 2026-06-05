const publisherService = require("../services/publisher.service");

exports.createPublisher = async (req, res, next) => {
  try {
    const result = await publisherService.createPublisher(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

exports.getAllPublishers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await publisherService.getAllPublishers(page, limit);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

exports.getPublisherByMaNXB = async (req, res, next) => {
  try {
    const result = await publisherService.getPublisherByCondition({
      MaNXB: req.params.MaNXB,
    });
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

exports.getPublisherByTenNXB = async (req, res, next) => {
  try {
    const result = await publisherService.getPublisherByCondition({
      TenNXB: req.params.TenNXB,
    });
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

exports.updatePublisher = async (req, res, next) => {
  try {
    const result = await publisherService.updatePublisher(
      req.params.MaNXB,
      req.body,
    );
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

exports.deletePublisher = async (req, res, next) => {
  try {
    await publisherService.deletePublisher(req.params.MaNXB);
    res
      .status(200)
      .json({ success: true, message: "Xóa nhà xuất bản thành công" });
  } catch (err) {
    next(err);
  }
};
