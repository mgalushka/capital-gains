// @flow
const moment = require("moment");
import type { Portfolio, Transaction } from "./portfolio"

type TransactionGroupCalculationType = "SAME_DAY" | "30_DAYS" | "HOLDING";

type TransactionGroup = {
  transactions: Array<Transaction>,
  type: TransactionGroupCalculationType,
}

// this is implementation for UK matching rules strategy:
// https://www.gov.uk/government/publications/shares-and-capital-gains-tax-hs284-self-assessment-helpsheet/shares-and-capital-gains-tax-hs284-self-assessment-helpsheet
class TransactionGroupStrategy {
  transactions: Array<Transaction> = [];
  indexByDate: Map<string, Array<Transaction>> = new Map();
  indexByStock: Map<string, Array<Transaction>> = new Map();

  constructor(portfolio: Portfolio) {
    this.transactions = portfolio.transactions;
    this.createIndexes();
  }

  createIndexes(): void {
    let index_by_date_map: Map<string, Array<Transaction>> = new Map();
    this.indexByDate = this.transactions.reduce(
      (index, trx) => {
        if (!index.has(trx.date)) {
          const empty: Transaction[] = [];
          index.set(trx.date, empty);
        }
        let arr = index.get(trx.date);
        if (arr !== undefined) {
            arr.push(trx);
        }
        return index;
      },
      index_by_date_map,
    );
    console.log('Index by date');
    console.log(this.indexByDate);

    let index_by_stock_map: Map<string, Array<Transaction>> = new Map();
    this.indexByStock = this.transactions.reduce(
      (index, trx) => {
        if (!index.has(trx.index)) {
          const empty: Transaction[] = [];
          index.set(trx.index, empty);
        }
        let arr = index.get(trx.index);
        if (arr !== undefined) {
            arr.push(trx);
        }
        return index;
      },
      index_by_stock_map,
    );
    console.log('Index by stock');
    console.log(this.indexByStock);
  }

  groupped(): ?TransactionGroup {
    return null;
  }

  groupSameDay(): Array<TransactionGroup> {
    // day -> Array
    let sameDayGroups = new Map();
    for (let i = 0; i < self.transactions.length; i++) {

    }
    return [];  // temporarily
  }

  ungroupped(): ?TransactionGroup {
    return null;
  }
}

function group(portfolio: Portfolio): ?TransactionGroup {
  const group_strategy = new TransactionGroupStrategy(portfolio);
  return group_strategy.groupped();
}

module.exports = {
  group,
  TransactionGroupStrategy,
}
