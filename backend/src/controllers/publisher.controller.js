const publisherService = require("../services/publisher.service");

exports.createPublisher = async (req, res, next) => {
  try {
    const result = await publisherService.createPublisher(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

exports.getPublishers = async (req, res, next) => {
  try {
    const { TenNXB, page, limit } = req.query;

    const filter = {};
    if (TenNXB) {
      filter.TenNXB = {
        $regex: TenNXB,
        $options: "i",
      };
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    const result = await publisherService.getPublishers(
      filter,
      pageNum,
      limitNum,
    );
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

exports.getPublisherByMaNXB = async (req, res, next) => {
  try {
    const result = await publisherService.getPublisherByMaNXB({
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
