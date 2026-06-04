const express = require("express");
require("dotenv").config();
const cors = require("cors");
const connection = require("./config/database");
const readerRoutes = require("./routes/reader.routes");

const app = express();
const port = process.env.PORT || 8888;

// config cors
app.use(cors());

// config req.body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// config routes
app.use("/api/readers", readerRoutes);

//Cac route khac

//handle 404 response
app.use((req, res, next) => {
  return next(new ApiError(404, "Resource not found"));
});

//define error-handling middleware last, after other app.use() and routes calls
app.use((err, req, res, next) => {
  return res.status(err.statusCode || 500).json({
    message: err.message || "Internal Server Error",
  });
});

(async () => {
  try {
    await connection();
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.log("Error connecting to database", error);
  }
})();
