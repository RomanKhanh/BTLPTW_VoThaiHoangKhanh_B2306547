require("dotenv").config();
const connection = require("./config/database");
const { Publisher, Book } = require("./models");
const bookService = require("./services/book.service");

(async () => {
  try {
    await connection();

    // Sample publishers
    const publishersData = [
      { MaNXB: "NXB001", TenNXB: "Nhà xuất bản Trẻ" },
      { MaNXB: "NXB002", TenNXB: "Nhà xuất bản Giáo Dục" },
      { MaNXB: "NXB003", TenNXB: "Nhà xuất bản Văn Học" },
    ];

    const publishers = [];
    for (const p of publishersData) {
      const existing = await Publisher.findOne({ MaNXB: p.MaNXB });
      if (existing) {
        publishers.push(existing);
      } else {
        const created = await Publisher.create({ ...p });
        publishers.push(created);
      }
    }

    // Sample books with images (using picsum.photos)
    const booksData = [
      {
        TenSach: "Hành trình vạn dặm",
        DonGia: 120000,
        SoQuyen: 5,
        NamXuatBan: 2018,
        MaNXB: publishers[0]._id,
        NguonGocTacGia: "Nguyễn Văn A",
        image: "https://picsum.photos/seed/book1/400/600",
      },
      {
        TenSach: "Lãnh đạo bản thân",
        DonGia: 95000,
        SoQuyen: 3,
        NamXuatBan: 2020,
        MaNXB: publishers[1]._id,
        NguonGocTacGia: "Trần Thị B",
        image: "https://picsum.photos/seed/book2/400/600",
      },
      {
        TenSach: "Những câu chuyện nhỏ",
        DonGia: 60000,
        SoQuyen: 8,
        NamXuatBan: 2015,
        MaNXB: publishers[2]._id,
        NguonGocTacGia: "Lê Văn C",
        image: "https://picsum.photos/seed/book3/400/600",
      },
    ];

    for (const b of booksData) {
      // Avoid creating duplicate by title + publisher
      const exists = await Book.findOne({ TenSach: b.TenSach, MaNXB: b.MaNXB });
      if (exists) {
        console.log("Book already exists:", b.TenSach);
        continue;
      }
      // Use service to let it generate MaSach
      await bookService.createBook(b);
      console.log("Created book:", b.TenSach);
    }

    console.log("Seeding books completed");
    process.exit(0);
  } catch (err) {
    console.error("Seeding books failed", err);
    process.exit(1);
  }
})();
