const { Publisher } = require("../models/");

exports.createPublisher = async (data) => {
  const existingPublisher = await Publisher.findOne({
    $or: [{ MaNXB: data.MaNXB }, { TenNXB: data.TenNXB }],
  });
  if (existingPublisher) {
    if (existingPublisher.MaNXB === data.MaNXB) {
      throw { status: 400, message: "Mã NXB đã tồn tại" };
    }
    if (existingPublisher.TenNXB === data.TenNXB) {
      throw { status: 400, message: "Tên NXB đã tồn tại" };
    }
  }
  const publisher = await Publisher.create(data);
  return publisher;
};

exports.getAllPublishers = async (page, limit) => {
  const skip = (page - 1) * limit;

  const [publishers, total] = await Promise.all([
    Publisher.find().sort({ TenNXB: 1, MaNXB: 1 }).skip(skip).limit(limit),
    Publisher.countDocuments(),
  ]);

  return {
    data: publishers,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

exports.getPublisherByCondition = async (condition) => {
  const publisher = await Publisher.findOne(condition);
  if (!publisher) {
    throw {
      status: 404,
      message: `Nhà xuất bản không tồn tại`,
    };
  }
  return publisher;
};

exports.updatePublisher = async (MaNXB, data) => {
  // Không cho phép cập nhật MaNXB
  delete data.MaNXB;
  const publisher = await Publisher.findOneAndUpdate({ MaNXB }, data, {
    new: true,
    runValidators: true,
  });
  if (!publisher) {
    throw {
      status: 404,
      message: "Nhà xuất bản không tồn tại",
    };
  }
  return publisher;
};

exports.deletePublisher = async (MaNXB) => {
  const publisher = await Publisher.findOneAndDelete({ MaNXB });
  if (!publisher) {
    throw {
      status: 404,
      message: "Nhà xuất bản không tồn tại",
    };
  }
  return {
    status: 200,
    message: "Xóa nhà xuất bản thành công",
  };
};
