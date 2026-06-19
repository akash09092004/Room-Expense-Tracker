const Expense = require(
  "../models/Expense"
);

const expenseLockMiddleware =
  async (req, res, next) => {
    try {
      const expense =
        await Expense.findById(
          req.params.id
        );

      if (!expense) {
        return res.status(404).json({
          success: false,
          message:
            "Expense not found",
        });
      }

      // Admin Override
      if (
        req.user.role === "admin"
      ) {
        req.expense = expense;
        return next();
      }

      const hoursPassed =
        (Date.now() -
          expense.createdAt.getTime()) /
        (1000 * 60 * 60);

      if (hoursPassed > 12) {
        return res.status(403).json({
          success: false,
          message:
            "Expense locked after 12 hours",
        });
      }

      req.expense = expense;

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

module.exports =
  expenseLockMiddleware;