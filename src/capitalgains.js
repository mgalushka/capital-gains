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

  // accumulate transaction for later computation
  add(transaction: TransactionType): Gains {
    this.transactions.push(transaction);
    return this;
  };

  // computing total balance, if transaction is BUY we add, SELL - subtract
  balance(): number {
    return this.transactions.reduce(
      (accumulator, trx) => {
        if (trx.type === "BUY") {
          return accumulator + trx.amount;
        } else {
          return accumulator - trx.amount;
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

function gains (): Gains {
  return new Gains();
}

module.exports = gains;
