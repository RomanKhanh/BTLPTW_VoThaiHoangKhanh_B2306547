const { Book, MonitorLoan, Counter } = require("../models");

async function getNextBookCode() {
  const counter = await Counter.findByIdAndUpdate(
    "book",
    { $inc: { seq: 1 } },
    {
      new: true,
      returnDocument: "after",
      upsert: true,
    },
  );

  return `S${String(counter.seq).padStart(3, "0")}`;
}

exports.getBooksByCondition = async (filter = {}, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const [books, total] = await Promise.all([
    Book.find(filter)
      .populate("MaNXB")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Book.countDocuments(filter),
  ]);

  return {
    data: books,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

exports.getBookByMaSach = async (MaSach) => {
  const book = await Book.findOne({ MaSach }).populate("MaNXB");
  if (!book) {
    throw {
      status: 404,
      message: `Không tìm thấy sách với mã ${MaSach}`,
    };
  }
  return book;
};

exports.createBook = async (bookData) => {
  bookData.MaSach = await getNextBookCode();
  const newBook = await Book.create(bookData);
  return newBook;
};

exports.updateBook = async (MaSach, updateData) => {
  const updatedBook = await Book.findOneAndUpdate({ MaSach }, updateData, {
    new: true,
    returnDocument: "after",
    runValidators: true,
  });
  if (!updatedBook) {
    throw {
      status: 404,
      message: "Book not found",
    };
  }
  return updatedBook;
};

exports.deleteBook = async (MaSach) => {
  const book = await Book.findOne({ MaSach });
  if (!book) {
    throw {
      status: 404,
      message: "Không tìm thấy sách hợp lệ",
    };
  }
  const borrowing = await MonitorLoan.findOne({
    MaSach: book._id,
    NgayTra: null,
  });

  if (borrowing) {
    throw {
      status: 400,
      message: "Không thể xóa sách vì đang được mượn",
    };
  }
  await Book.deleteOne({ _id: book._id });
  return {
    message: "Delete book successfully",
  };
};
