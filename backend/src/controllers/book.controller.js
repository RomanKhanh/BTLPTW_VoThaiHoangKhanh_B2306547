const bookService = require("../services/book.service");

exports.getBooks = async (req, res, next) => {
  try {
<<<<<<< HEAD
    const { TenSach, NamXuatBan, publisherId, page, limit } = req.query;
=======
    const { TenSach, NamXuatBan, publisherId } = req.query;
>>>>>>> 128f6133a0c05ad620a1b07ee3edc6c841ff138b

    const filter = {};

    if (TenSach) {
      filter.TenSach = {
        $regex: TenSach,
        $options: "i",
      };
    }

    if (NamXuatBan) {
      filter.NamXuatBan = Number(NamXuatBan);
    }

    if (publisherId) {
      filter.MaNXB = publisherId;
    }

<<<<<<< HEAD
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    const result = await bookService.getBooksByCondition(
      filter,
      pageNum,
      limitNum,
    );
    res.status(200).json({ success: true, ...result });
=======
    const books = await bookService.getBooksByCondition(filter);
    res.status(201).json({ success: true, data: books });
>>>>>>> 128f6133a0c05ad620a1b07ee3edc6c841ff138b
  } catch (err) {
    next(err);
  }
};

exports.getBookByMaSach = async (req, res, next) => {
  try {
    const { MaSach } = req.params;
    const book = await bookService.getBookByMaSach(MaSach);
    res.status(200).json({ success: true, data: book });
  } catch (err) {
    next(err);
  }
};

exports.createBook = async (req, res, next) => {
  try {
    const bookData = req.body;
    const newBook = await bookService.createBook(bookData);
    res.status(201).json({ success: true, data: newBook });
  } catch (err) {
    next(err);
  }
};

exports.updateBook = async (req, res, next) => {
  try {
    const { MaSach } = req.params;
    const updateData = req.body;
    const updatedBook = await bookService.updateBook(MaSach, updateData);
    res.status(200).json({ success: true, data: updatedBook });
  } catch (err) {
    next(err);
  }
};

exports.deleteBook = async (req, res, next) => {
  try {
    const { MaSach } = req.params;
    await bookService.deleteBook(MaSach);
    res
      .status(200)
      .json({ success: true, message: "Book deleted successfully" });
  } catch (err) {
    next(err);
  }
};
