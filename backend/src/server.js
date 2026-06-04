const express = require("express");
require("dotenv").config();
const cors = require("cors");
const connection = require("./config/database");
const cookieParser = require("cookie-parser");

const app = express();
const port = process.env.PORT || 8888;

// config cors
app.use(cors());

// config req.body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//config cookie
app.use(cookieParser());

//config authenticate middleware
const authenticate = require("./middleware/auth");
app.use(authenticate);

// Routes
app.use("/api/auth", require("./routes/auth.route"));

const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);

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
