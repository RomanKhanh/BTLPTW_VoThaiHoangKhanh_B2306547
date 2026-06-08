const readerService = require("../services/reader.service");

exports.createReader = async (req, res, next) => {
  try {
    const readerData = req.body;
    const newReader = await readerService.createReader(readerData);
    res.status(201).json({ success: true, data: newReader });
  } catch (err) {
    next(err);
  }
};

exports.getReaderByMaDocGia = async (req, res, next) => {
  try {
    const { MaDocGia } = req.params;
    const reader = await readerService.getReaderByMaDocGia(MaDocGia);
    res.status(200).json({ success: true, data: reader });
  } catch (err) {
    next(err);
  }
};

exports.getReaders = async (req, res, next) => {
  try {
    const { HoLot, Ten, DiaChi, Phai, NgaySinh, DienThoai } = req.query;
    const filter = {};

    if (HoLot) {
      filter.HoLot = {
        $regex: HoLot,
        $options: "i",
      };
    }

    if (Ten) {
      filter.Ten = {
        $regex: Ten,
        $options: "i",
      };
    }

    if (DiaChi) {
      filter.DiaChi = {
        $regex: DiaChi,
        $options: "i",
      };
    }

    if (Phai) {
      filter.Phai = {
        $regex: `^${Phai}$`,
        $options: "i",
      };
    }

    if (NgaySinh) {
      filter.NgaySinh = new Date(NgaySinh);
    }

    if (DienThoai) {
      filter.DienThoai = DienThoai;
    }

    const readers = await readerService.getReadersByfilter(filter);
    res.status(200).json({ success: true, data: readers });
  } catch (err) {
    next(err);
  }
};

exports.updateReader = async (req, res, next) => {
  try {
    const result = await readerService.updateReader(
      req.params.MaDocGia,
      req.body,
    );
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(err);
  }
};

exports.deleteReader = async (req, res, next) => {
  try {
    const { MaDocGia } = req.params;
    await readerService.deleteReader(MaDocGia);
    return res
      .status(200)
      .json({ success: true, message: "Xóa độc giả thành công" });
  } catch (error) {
    next(error);
  }
};
