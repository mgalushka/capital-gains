// @flow
const moment = require("moment");
import type { Portfolio, Transaction } from "./portfolio"

type TransactionGroupCalculationType = "SAME_DAY" | "30_DAYS" | "HOLDING";

type GroupMetadata = {
  date: string,
}

type TransactionGroup = {
  index: string,
  transactions: Transaction[],
  type: TransactionGroupCalculationType,
  groupMetadata: ?GroupMetadata,
}

type InternalTransaction = {
  ...Transaction,
  tracked: boolean,
}

// this is implementation for UK matching rules strategy:
// https://www.gov.uk/government/publications/shares-and-capital-gains-tax-hs284-self-assessment-helpsheet/shares-and-capital-gains-tax-hs284-self-assessment-helpsheet
class TransactionGroupStrategy {
  transactions: InternalTransaction[] = [];
  indexByDate: Map<string, InternalTransaction[]> = new Map();
  indexByStock: Map<string, InternalTransaction[]> = new Map();

  constructor(portfolio: Portfolio) {
    this.transactions = portfolio.transactions.map(tr => {
      var joined: InternalTransaction = {...tr, tracked: false};
      joined.tracked = false;
      return (joined: InternalTransaction);
    });
    this.createIndexes();
  }

  createIndexes(): void {
    this.indexByDate = this.mapByDate(this.transactions);
    this.indexByStock = this.mapByIndex(this.transactions);
  }

  groupped(): TransactionGroup[] {
    return [];
  }

  groupSameDay(): TransactionGroup[] {
    let groups: TransactionGroup[] = [];
    // day -> index -> Array
    let it = this.indexByDate.entries();
    let entry = it.next();
    while (!entry.done) {
      const date = entry.value[0];
      const trans: InternalTransaction[] = entry.value[1];
      if (trans.length <= 1) {
        entry = it.next();
        continue;
      }
      const stockGroup: Map<string, InternalTransaction[]> = this.mapByIndex(trans);
      stockGroup.forEach((transactionsArray, index, map) => {
        groups.push({
          index: index,
          transactions: this.reduce(transactionsArray),
          type: "SAME_DAY",
          groupMetadata: {date},
        });
      });
      entry = it.next();
    }
    return groups;
  }

  groupBedAndBreakfasting(): TransactionGroup[] {
    let groups: TransactionGroup[] = [];
    // For every SELL transaction, we need to find
    // if there were any buy transactions in the last 30 days for same stock
    // Those will be matched as bed and breakfasting rule.

    // To compute this we first sort indexByDate in descending order


    return groups;
  }

  mapByIndex(transactions: InternalTransaction[]): Map<string, InternalTransaction[]> {
    let index_by_index_map: Map<string, InternalTransaction[]> = new Map();
    return transactions.reduce(
      (index, trx) => {
        if (trx === undefined || trx.index === undefined) {
          return index;
        }
        const indexValue = trx.index;
        if (!index.has(indexValue)) {
          const empty: InternalTransaction[] = [];
          index.set(indexValue, empty);
        }
        let arr = index.get(indexValue);
        if (arr !== undefined) {
            arr.push(trx);
        }
        return index;
      },
      index_by_index_map,
    );
  }

  mapByDate(transactions: InternalTransaction[]): Map<string, InternalTransaction[]> {
    let index_by_date_map: Map<string, InternalTransaction[]> = new Map();
    return transactions.reduce(
      (index, trx) => {
        if (trx === undefined || trx.date === undefined) {
          return index;
        }
        const dateValue = trx.date;
        if (!index.has(dateValue)) {
          const empty: InternalTransaction[] = [];
          index.set(dateValue, empty);
        }
        let arr = index.get(dateValue);
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

  reduce(transactions: InternalTransaction[]): Transaction[] {
    return transactions.map(t => {
      var reduced = t;
      delete reduced.tracked;
      return ((reduced: any): Transaction);
    });
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
