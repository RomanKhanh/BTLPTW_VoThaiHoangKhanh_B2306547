require("dotenv").config();
const connection = require("./config/database");
const mongoose = require("mongoose");
const { MonitorLoan } = require("./models");

(async () => {
  try {
    await connection();

    const MaDocGia = new mongoose.Types.ObjectId("6a34e72780c666db034b29a5");
    const MaSach = new mongoose.Types.ObjectId("6a34e30fca5305fcc876b844");
    const NgayMuon = new Date("2026-06-06");
    const NgayTra = null;
    const NgayHenTra = new Date("2026-06-17");

    const monitorLoan = await MonitorLoan.create({
      MaDocGia,
      MaSach,
      NgayMuon,
      NgayTra,
      NgayHenTra,
    });
    console.log("Tạo tài khoản staff đầu tiên thành công:");
    console.log({ ...monitorLoan });
    process.exit(0);
  } catch (err) {
    console.error("Lỗi khi tạo staff đầu tiên:", err);
    process.exit(1);
  }
})();
