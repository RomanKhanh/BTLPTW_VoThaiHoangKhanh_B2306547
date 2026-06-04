const { Reader } = require("../models");

class ReaderService {
  async createReader(data) {
    try {
      const reader = await Reader.create(data);
      return {
        EC: 0,
        EM: "Created reader successfully",
      };
    } catch (error) {
      console.log("Error creating reader", error);
      return {
        EC: 1,
        EM: "Error creating reader",
      };
    }
  }
}

module.exports = ReaderService;
