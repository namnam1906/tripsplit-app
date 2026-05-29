export function calculateSettlement(members, expenses) {
  const balance = Object.fromEntries(members.map((name) => [name, 0]));

  for (const expense of expenses) {
    const paidBy = expense.paidBy;
    const amount = Number(expense.amount || 0);
    const splitWith = expense.splitWith?.length ? expense.splitWith : members;

    if (!balance[paidBy]) balance[paidBy] = 0;
    balance[paidBy] += amount;

    const perPerson = amount / splitWith.length;
    for (const member of splitWith) {
      if (!balance[member]) balance[member] = 0;
      balance[member] -= perPerson;
    }
  }

  const debtors = Object.entries(balance)
    .filter(([, amount]) => amount < -0.01)
    .map(([name, amount]) => ({ name, amount: -amount }));
  const creditors = Object.entries(balance)
    .filter(([, amount]) => amount > 0.01)
    .map(([name, amount]) => ({ name, amount }));

  const settlements = [];
  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];
    const amount = Math.min(debtor.amount, creditor.amount);

    settlements.push({
      from: debtor.name,
      to: creditor.name,
      amount: Number(amount.toFixed(2))
    });

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount < 0.01) debtorIndex += 1;
    if (creditor.amount < 0.01) creditorIndex += 1;
  }

  return settlements;
}
