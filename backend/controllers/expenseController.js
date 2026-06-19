const Expense = require("../models/Expense");
const Group = require("../models/Group");
const User = require("../models/User");
const generateInviteCode = require("../utils/generateInviteCode");

const canManageExpense = (expense, user) => {
  if (!expense || !user) return false;

  return (
    user.role === "admin" ||
    expense.user?.toString() === user.id
  );
};

const resolveUserGroup = async (user) => {
  if (!user) return null;

  if (user.currentGroup) {
    return Group.findById(user.currentGroup);
  }

  return Group.findOne({
    members: user._id,
  });
};

const resolveOrCreateUserGroup = async (user) => {
  const existingGroup = await resolveUserGroup(user);

  if (existingGroup) {
    return existingGroup;
  }

  const fallbackGroup = await Group.create({
    name: `${user.name || "Personal"}'s group`,
    inviteCode: generateInviteCode(),
    admin: user._id,
    members: [user._id],
  });

  user.currentGroup = fallbackGroup._id;
  await user.save();

  return fallbackGroup;
};

const normalizeCategory = (category) => {
  return String(category || "")
    .trim()
    .toLowerCase();
};

exports.addExpense = async (req, res) => {
  try {
    const {
      itemName,
      amount,
      category,
    } = req.body;

    const user = await User.findById(
      req.user.id
    );
    const group = await resolveOrCreateUserGroup(user);

    const expense = await Expense.create({
      group: group._id,
      user: user._id,
      itemName,
      amount,
      category: normalizeCategory(category),
    });

    res.status(201).json({
      success: true,
      expense,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getExpenses = async (req, res) => {
  try {
    const user = await User.findById(
      req.user.id
    );
    const group = await resolveUserGroup(user);

    const expenses = await Expense.find({
      group: group?._id,
      isDeleted: false,
    }).populate("user", "name email role");

    res.status(200).json({
      success: true,
      expenses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    const user = await User.findById(req.user.id);

    if (!canManageExpense(expense, user)) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own expense",
      });
    }

    const diff =
      (Date.now() -
        expense.createdAt.getTime()) /
      (1000 * 60 * 60);

    if (
      diff > 12 &&
      user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Expense Locked",
      });
    }

    const payload = {
      ...req.body,
    };

    if (payload.amount !== undefined) {
      payload.amount = Number(payload.amount);
    }

    if (payload.category !== undefined) {
      payload.category = normalizeCategory(payload.category);
    }

    const updated = await Expense.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    const user = await User.findById(req.user.id);

    if (!canManageExpense(expense, user)) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own expense",
      });
    }

    const diff =
      (Date.now() -
        expense.createdAt.getTime()) /
      (1000 * 60 * 60);

    if (
      diff > 12 &&
      user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Expense Locked",
      });
    }

    expense.isDeleted = true;

    await expense.save();

    res.status(200).json({
      success: true,
      message: "Expense deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
