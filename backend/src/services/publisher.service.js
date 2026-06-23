const { Publisher, Book, Counter } = require("../models/");

async function getNextPublisherCode() {
  const counter = await Counter.findByIdAndUpdate(
    "publisher",
    { $inc: { seq: 1 } },
    {
      new: true,
      returnDocument: "after",
      upsert: true,
    },
  );

  return `NXB${String(counter.seq).padStart(3, "0")}`;
}

exports.createPublisher = async (data) => {
  const existingPublisher = await Publisher.findOne({
    TenNXB: data.TenNXB,
  });
  if (existingPublisher) {
    if (existingPublisher.TenNXB === data.TenNXB) {
      throw { status: 400, message: "Tên NXB đã tồn tại" };
    }
  }
  data.MaNXB = await getNextPublisherCode();
  const publisher = await Publisher.create(data);
  return publisher;
};

exports.getPublishers = async (filter, page, limit) => {
  const skip = (page - 1) * limit;

  const [publishers, total] = await Promise.all([
    Publisher.find(filter)
      .sort({ TenNXB: 1, MaNXB: 1 })
      .skip(skip)
      .limit(limit),
    Publisher.countDocuments(filter),
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

exports.getPublisherByMaNXB = async (MaNXB) => {
  const publisher = await Publisher.findOne({ MaNXB });
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
    returnDocument: "after",
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
  const publisher = await Publisher.findOne({ MaNXB });
  if (!publisher) {
    throw {
      status: 404,
      message: "Nhà xuất bản không tồn tại",
    };
  }
  // Kiểm tra sách thuộc NXB này
  const bookExists = await Book.exists({
    MaNXB: publisher._id,
  });
  if (bookExists) {
    throw {
      status: 400,
      message:
        "Không thể xóa nhà xuất bản vì vẫn còn sách thuộc nhà xuất bản này",
    };
  }
  await Publisher.deleteOne({ _id: publisher._id });
  return {
    status: 200,
    message: "Xóa nhà xuất bản thành công",
  };
};
