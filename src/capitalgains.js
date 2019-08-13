// @flow
import type { Currency } from "./currency"

type TransactionType = "BUY" | "SELL";

type Transaction = {
  amount: number,
  currency: Currency,
  type: TransactionType,
};

class Gains {
  transactions: Array<TransactionType> = new Array();
  add(transaction: TransactionType): Gains {
    this.transactions.push(transaction);
    return this;
  }
};

function gains (): Gains {
  return new Gains();
}

module.exports = gains;
