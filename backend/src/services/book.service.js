const { Book, Counter } = require("../models");

async function getNextBookCode() {
  const counter = await Counter.findByIdAndUpdate(
    "book",
    { $inc: { seq: 1 } },
    {
      new: true,
      upsert: true,
    },
  );

  return `S${String(counter.seq).padStart(3, "0")}`;
}

exports.getBooksByCondition = async (filter = {}) => {
  return await Book.find(filter).populate("MaNXB");
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
  const deletedBook = await Book.findOneAndDelete({ MaSach });
  if (!deletedBook) {
    throw {
      status: 404,
      message: "Book not found",
    };
  }
  return deletedBook;
};
