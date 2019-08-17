// @flow
const moment = require("moment");
import type { Currency } from "./currency"

type TransactionDirection = "BUY" | "SELL";

type TransactionType = {
  index: string,
  price: number,
  amount: number,
  currency: Currency,
  type: TransactionDirection,
  date: string,
};

class Transaction {
  index: string;
  price: number;
  amount: number;
  currency: Currency;
  direction: TransactionDirection;
  date: string;

  constructor(
    index: string,
    price: number,
    amount: number,
    currency: Currency,
    direction: TransactionDirection,
    date: string,
  ) {
    this.index = index;
    this.price = price;
    this.amount = amount;
    this.currency = currency;
    this.direction = direction;
    this.date = date;
  }
}

class Portfolio {
  transactions: Array<Transaction> = [];

  // accumulate transactions for later computation
  add(transaction: Transaction): Portfolio {
    this.transactions.push(transaction);
    return this;
  };

  // computing total balance, if transaction is BUY we add, SELL - subtract
  balance(): number {
    return this.transactions.reduce(
      (accumulator, trx) => {
        const cost = trx.price * trx.amount;
        if (trx.direction === "BUY") {
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

function new_portfolio(): Portfolio {
  return new Portfolio();
}

function new_transaction(
  index: string,
  price: number,
  amount: number,
  currency: Currency,
  direction: TransactionDirection,
  date: string,
): Transaction {
  return new Transaction(index, price, amount, currency, direction, date);
}

module.exports = {
  Portfolio,
  Transaction,
  new_portfolio,
  new_transaction,
}
