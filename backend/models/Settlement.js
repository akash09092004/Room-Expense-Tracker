const mongoose = require("mongoose");

const settlementSchema = new mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
    },
    month: Number,
    year: Number,
    totalAmount: Number,
    perHeadShare: Number,
    transactions: [
      {
        from: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        to: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        amount: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Settlement", settlementSchema);