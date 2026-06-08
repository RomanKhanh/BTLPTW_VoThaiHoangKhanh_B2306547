const { Reader, MonitorLoan, Counter } = require("../models/");

async function getNextReaderCode() {
  const counter = await Counter.findByIdAndUpdate(
    "reader",
    { $inc: { seq: 1 } },
    {
      new: true,
      upsert: true,
    },
  );

  return `DG${String(counter.seq).padStart(3, "0")}`;
}

exports.createReader = async (data) => {
  data.MaDocGia = await getNextReaderCode();
  const newReader = await Reader.create(data);
  return newReader;
};

exports.getReadersByfilter = async (filter = {}) => {
  return await Reader.find(filter);
};

exports.getReaderByMaDocGia = async (MaDocGia) => {
  const reader = await Reader.findOne({ MaDocGia });
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
  const reader = await Reader.findOneAndUpdate({ MaDocGia }, data, {
    new: true,
    runValidators: true,
  });
  if (!reader) {
    throw {
      status: 404,
      message: `Không tìm thấy độc giả với mã ${MaDocGia}`,
    };
  }
  return reader;
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
