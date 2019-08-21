// @flow
const moment = require("moment");
import type { Portfolio, Transaction } from "./portfolio"

type TransactionGroupCalculationType = "SAME_DAY" | "30_DAYS" | "HOLDING";

type TransactionGroup = {
  transactions: Transaction[],
  type: TransactionGroupCalculationType,
}

// this is implementation for UK matching rules strategy:
// https://www.gov.uk/government/publications/shares-and-capital-gains-tax-hs284-self-assessment-helpsheet/shares-and-capital-gains-tax-hs284-self-assessment-helpsheet
class TransactionGroupStrategy {
  transactions: Transaction[] = [];
  indexByDate: Map<string, Transaction[]> = new Map();
  indexByStock: Map<string, Transaction[]> = new Map();

  constructor(portfolio: Portfolio) {
    this.transactions = portfolio.transactions;
    this.createIndexes();
  }

  createIndexes(): void {
    this.indexByDate = this.mapByDate(this.transactions);
    console.log('Index by date');
    console.log(this.indexByDate);

    this.indexByStock = this.mapByIndex(this.transactions);
    console.log('Index by stock');
    console.log(this.indexByStock);
  }

  groupped(): TransactionGroup[] {
    return [];
  }

  groupSameDay(): TransactionGroup[] {
    // day -> Array
    let sameDayGroups: Map<string, Transaction[]> = new Map();
    for (let i = 0; i < self.indexByDate.length; i++) {

    }
    return [];  // temporarily
  }

  mapByIndex(transactions: Transaction[]): Map<string, Transaction[]> {
    let index_by_index_map: Map<string, Transaction[]> = new Map();
    return transactions.reduce(
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
      index_by_index_map,
    );
  }

  mapByDate(transactions: Transaction[]): Map<string, Transaction[]> {
    let index_by_date_map: Map<string, Transaction[]> = new Map();
    return transactions.reduce(
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
  }

  ungroupped(): TransactionGroup[] {
    return [];
  }
}

function group(portfolio: Portfolio): TransactionGroup[] {
  const group_strategy = new TransactionGroupStrategy(portfolio);
  return group_strategy.groupped();
}

module.exports = {
  group,
  TransactionGroupStrategy,
}
