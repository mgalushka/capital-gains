// @flow
import type { Currency } from "./currency"

type TransactionType = "BUY" | "SELL";

type Transaction = {
  index: string,
  price: number,
  amount: number,
  currency: Currency,
  type: TransactionType,
};

class Gains {
  transactions: Array<Transaction> = [];

  // accumulate transactions for later computation
  add(transaction: Transaction): Gains {
    this.transactions.push(transaction);
    return this;
  };

  // computing total balance, if transaction is BUY we add, SELL - subtract
  balance(): number {
    return this.transactions.reduce(
      (accumulator, trx) => {
        const cost = trx.price * trx.amount;
        if (trx.type === "BUY") {
          return accumulator + cost;
        } else {
          return accumulator - cost;
        }
      },
      0,
    );
  };

  // returns number of transactions
  count(): number {
    return this.transactions.length;
  }
};

function new_gains(): Gains {
  return new Gains();
}

module.exports = {
  new_gains,
  Gains,
}
