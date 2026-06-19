const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const dns = require ("dns");

dns.setServers(["1.1.1.1","8.8.8.8"])

const connectDB =
require("./config/db");

dotenv.config();

const app = express();

// Database Connection
connectDB();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use(
  "/api/auth",
  require("./routes/authRoutes")
);

app.use(
  "/api/groups",
  require("./routes/groupRoutes")
);

app.use(
  "/api/expenses",
  require("./routes/expenseRoutes")
);

app.use(
  "/api/settlements",
  require("./routes/settlementRoutes")
);

// Health Check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message:
      "Room Expense Tracker API Running",
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

// Global Error Handler
app.use(
  (err, req, res, next) => {
    console.error(err);

    res.status(
      err.statusCode || 500
    ).json({
      success: false,
      message:
        err.message ||
        "Internal Server Error",
    });
  }
);

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `🚀 Server Running On Port ${PORT}`
  );
});