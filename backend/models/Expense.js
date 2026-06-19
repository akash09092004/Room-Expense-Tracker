const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    itemName: String,
    amount: Number,
    category: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Expense", expenseSchema);
