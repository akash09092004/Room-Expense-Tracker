const Expense = require("../models/Expense");
const Group = require("../models/Group");
const Settlement = require("../models/Settlement");

exports.closeMonth = async (
  req,
  res
) => {
  try {
    const group =
      await Group.findById(
        req.user.currentGroup
      );

    if (
      group.admin.toString() !==
      req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Only admin allowed",
      });
    }

    const expenses =
      await Expense.find({
        group: group._id,
        isDeleted: false,
      });

    const totalAmount =
      expenses.reduce(
        (sum, exp) =>
          sum + exp.amount,
        0
      );

    const perHeadShare =
      totalAmount /
      group.members.length;

    const userSpent = {};

    expenses.forEach((exp) => {
      const id =
        exp.user.toString();

      userSpent[id] =
        (userSpent[id] || 0) +
        exp.amount;
    });

    const balances = [];

    group.members.forEach((id) => {
      balances.push({
        user: id,
        balance:
          (userSpent[id] || 0) -
          perHeadShare,
      });
    });

    const creditors =
      balances.filter(
        (b) => b.balance > 0
      );

    const debtors =
      balances.filter(
        (b) => b.balance < 0
      );

    const transactions = [];

    let i = 0;
    let j = 0;

    while (
      i < creditors.length &&
      j < debtors.length
    ) {
      const credit =
        creditors[i];
      const debt =
        debtors[j];

      const amount = Math.min(
        credit.balance,
        Math.abs(debt.balance)
      );

      transactions.push({
        from: debt.user,
        to: credit.user,
        amount,
      });

      credit.balance -= amount;
      debt.balance += amount;

      if (credit.balance === 0)
        i++;
      if (debt.balance === 0)
        j++;
    }

    const settlement =
      await Settlement.create({
        group: group._id,
        month:
          new Date().getMonth() +
          1,
        year:
          new Date().getFullYear(),
        totalAmount,
        perHeadShare,
        transactions,
      });

    res.status(201).json({
      success: true,
      settlement,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};