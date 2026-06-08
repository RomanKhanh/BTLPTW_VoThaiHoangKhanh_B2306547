const { Reader, Counter } = require("../models/");

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
