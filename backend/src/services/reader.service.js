const { Reader, MonitorLoan, Counter } = require("../models/");

function toPublicReader(reader) {
  if (!reader) return reader;

  const plainReader = reader.toObject ? reader.toObject() : { ...reader };
  delete plainReader.Password;
  return plainReader;
}

async function getNextReaderCode() {
  const counter = await Counter.findByIdAndUpdate(
    "reader",
    { $inc: { seq: 1 } },
    {
      new: true,
      returnDocument: "after",
      upsert: true,
    },
  );

  return `DG${String(counter.seq).padStart(3, "0")}`;
}

exports.createReader = async (data) => {
  data.MaDocGia = await getNextReaderCode();
  const newReader = await Reader.create(data);
  return toPublicReader(newReader);
};

exports.getReadersByfilter = async (filter = {}, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const [readers, total] = await Promise.all([
    Reader.find(filter).select("-Password").skip(skip).limit(limit),
    Reader.countDocuments(filter),
  ]);

  return {
    data: readers,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

exports.getReaderByMaDocGia = async (MaDocGia) => {
  const reader = await Reader.findOne({ MaDocGia }).select("-Password");
  if (!reader) {
    throw {
      status: 404,
      message: `Không tìm thấy độc giả với mã ${MaDocGia}`,
    };
  }
  return reader;
};

exports.updateReader = async (MaDocGia, data) => {
  delete data.MaDocGia;
  delete data.Password;

  const reader = await Reader.findOne({ MaDocGia });
  if (!reader) {
    throw {
      status: 404,
      message: `Không tìm thấy độc giả với mã ${MaDocGia}`,
    };
  }

  Object.assign(reader, data);
  await reader.save();

  return toPublicReader(reader);
};

exports.changePassword = async (MaDocGia, oldPassword, newPassword) => {
  const reader = await Reader.findOne({ MaDocGia });
  if (!reader) {
    throw {
      status: 404,
      message: `Không tìm thấy độc giả với mã ${MaDocGia}`,
    };
  }

  const isMatch = await reader.comparePassword(oldPassword);
  if (!isMatch) {
    throw {
      status: 400,
      message: "Mật khẩu hiện tại không đúng",
    };
  }

  reader.Password = newPassword;
  await reader.save();

  return {
    message: "Đổi mật khẩu độc giả thành công",
  };
};

// Staff đặt lại mật khẩu cho độc giả (không cần biết mật khẩu cũ)
exports.resetPasswordByStaff = async (MaDocGia, newPassword) => {
  const reader = await Reader.findOne({ MaDocGia });
  if (!reader) {
    throw {
      status: 404,
      message: `Không tìm thấy độc giả với mã ${MaDocGia}`,
    };
  }
  reader.Password = newPassword;
  await reader.save();
  return {
    message: "Đặt lại mật khẩu độc giả thành công",
  };
};

exports.deleteReader = async (MaDocGia) => {
  const reader = await Reader.findOne({ MaDocGia });
  if (!reader) {
    throw {
      status: 400,
      message: "Không tìm thấy độc giả hợp lệ",
    };
  }
  const borrowing = await MonitorLoan.findOne({
    MaDocGia: reader._id,
    NgayTra: null,
  });
  if (borrowing) {
    throw {
      status: 400,
      message: "Không thể xóa vì độc giả còn mượn sách chưa trả",
    };
  }
  await Reader.deleteOne({ _id: reader._id });
  return {
    message: "Delete reader successfully",
  };
};
