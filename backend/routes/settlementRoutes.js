const express = require("express");
const router = express.Router();

const {
  closeMonth,
} = require("../controllers/settlementController");

const authMiddleware = require("../middleware/authMiddleware");

// Generate Settlement
router.post(
  "/close",
  authMiddleware,
  closeMonth
);

module.exports = router;