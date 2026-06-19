const express = require("express");
require("dotenv").config();
const cors = require("cors");
const connection = require("./config/database");
const cookieParser = require("cookie-parser");

const app = express();
const port = process.env.PORT || 8888;

// config cors
<<<<<<< HEAD
const allowedOrigins = (
  process.env.CORS_ORIGIN || "http://localhost:5173"
).split(",");
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
=======
app.use(cors());
>>>>>>> 128f6133a0c05ad620a1b07ee3edc6c841ff138b

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
app.use("/api/staff", require("./routes/staff.route"));
app.use("/api/publishers", require("./routes/publisher.route"));
app.use("/api/books", require("./routes/book.route"));
app.use("/api/monitor-loans", require("./routes/monitorLoan.route"));
app.use("/api/readers", require("./routes/reader.route"));

// Error handling middleware
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
