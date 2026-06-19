const settlementCalculator = (
  expenses,
  members
) => {
  const totalAmount =
    expenses.reduce(
      (sum, expense) =>
        sum + expense.amount,
      0
    );

  const perHeadShare =
    totalAmount /
    members.length;

  const userSpent = {};

  expenses.forEach((expense) => {
    const userId =
      expense.user.toString();

    userSpent[userId] =
      (userSpent[userId] || 0) +
      expense.amount;
  });

  const balances = [];

  members.forEach((memberId) => {
    balances.push({
      user: memberId,
      balance:
        (userSpent[memberId] || 0) -
        perHeadShare,
    });
  });

  const creditors =
    balances.filter(
      (user) => user.balance > 0
    );

  const debtors =
    balances.filter(
      (user) => user.balance < 0
    );

  const transactions = [];

  let i = 0;
  let j = 0;

  while (
    i < creditors.length &&
    j < debtors.length
  ) {
    const creditor =
      creditors[i];

    const debtor =
      debtors[j];

    const amount = Math.min(
      creditor.balance,
      Math.abs(debtor.balance)
    );

    transactions.push({
      from: debtor.user,
      to: creditor.user,
      amount,
    });

    creditor.balance -= amount;
    debtor.balance += amount;

    if (creditor.balance === 0)
      i++;

    if (debtor.balance === 0)
      j++;
  }

  return {
    totalAmount,
    perHeadShare,
    transactions,
  };
};

module.exports =
  settlementCalculator;