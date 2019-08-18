// @flow
const moment = require("moment");
import type { Portfolio, Transaction } from "./portfolio"

type TransactionGroupCalculationType = "SAME_DAY" | "30_DAYS" | "HOLDING";

type TransactionGroup = {
  transactions: Array<Transaction>,
  type: TransactionGroupCalculationType,
}

class TransactionGroupStrategy {
  transactions: Array<Transaction> = [];

  constructor(transactions: Array<Transaction>) {
    this.transactions = transactions;
  }

  groupped(): ?TransactionGroup {
    return null;
  }

  ungroupped(): ?TransactionGroup {
    return null;
  }
}

function group(portfolio: Portfolio): ?TransactionGroup {
  const group_strategy = new TransactionGroupStrategy(portfolio.transactions);
  return group_strategy.groupped();
}

module.exports = {
  group,
}
