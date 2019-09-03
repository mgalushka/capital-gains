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

type Holding = {
  index: string,
  amount: number,
  cost: number,
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
    this.indexByStock = this.mapByIndex(this.transactions);
  }

  groupped(): TransactionGroup[] {
    return [];
  }

  // Algorithm:
  // Crete transaction pool by cloning list of transactions passed
  // Order transactions in ascending order by date
  // on every transaction compute:
  // if BUY - match against: 1. same day; 2. 30 days rule; 3 - add to holding
  //
  // remove matched transactions from transaction pool
  groupX(): TransactionGroup[] {
    let tracked = this.transactions.map(tr => tr.clone()).sort((a, b) => {
      const am = moment(a.date, 'YYYY-MM-DD');
      const bm = moment(b.date, 'YYYY-MM-DD')
      if (moment(am).isBefore(bm)) return -1;
      if (moment(am).isAfter(bm)) return 1;
      if (a.direction === b.direction) return 0;
      if (a.direction === 'BUY') return -1;
      else return 1;
    });
    var holdings: Map<string, Holding> = new Map();
    console.log(tracked);
    return [];
  }

  groupSameDay(): TransactionGroup[] {
    let groups: TransactionGroup[] = [];
    // day -> index -> Array
    let it = this.indexByDate.entries();
    let entry = it.next();
    while (!entry.done) {
      const date = entry.value[0];
      const trans: Transaction[] = entry.value[1];
      if (trans.length <= 1) {
        entry = it.next();
        continue;
      }
      const stockGroup: Map<string, Transaction[]> = this.mapByIndex(trans);
      stockGroup.forEach((transactionsArray, index, map) => {
        groups.push({
          index: index,
          transactions: transactionsArray,
          type: "SAME_DAY",
          groupMetadata: {date},
        });
      });
      entry = it.next();
    }
    return groups;
  }

  groupBedAndBreakfasting(): TransactionGroup[] {
    let matchedGroups: TransactionGroup[] = [];
    let unmatchedGroups: TransactionGroup[] = [];
    // For every SELL transaction, we need to find
    // if there were any buy transactions in the last 30 days for same stock
    // Those will be matched as bed and breakfasting rule.

    // To compute this we first sort indexByDate in descending order
    let sorted = new Map([...this.indexByDate.entries()].sort((a,b) => {
        if (a[0] === b[0]) return 0;
        if (a[0] < b[0]) return 1;
        else return -1;
      }
    ));
    // console.log(sorted);

    this.indexByStock.forEach((transactions, stock, map) => {
      let sorted = transactions.sort((a, b) => {
        const am = moment(a.date, 'YYYY-MM-DD');
        const bm = moment(b.date, 'YYYY-MM-DD')
        if (moment(am).isBefore(bm)) return 1;
        if (moment(am).isAfter(bm)) return -1;
        return 0;
      });
      // console.log(sorted);

      // TODO: add structure to track matching and unmatching method state

      for (let index = 0; index < sorted.length; index++) {
        const current: Transaction = sorted[index];
        if (current === undefined || current.amount === undefined) {
          continue;
        }
        let currentAmount = current.amount;
        if (currentAmount === undefined) {
          continue;
        }
        // console.log(current);

        // skip all BUY transactions as non relevant
        if (current.direction === 'BUY') {
          // TODO: add to unmatched transactions
          continue;
        }

        // if last transaction - nothing to match against
        if (index === sorted.length - 1) {
          // TODO: add to unmatched transactions
          break;
        }
        const sellDate = moment(current.date, 'YYYY-MM-DD');
        for (let internal = index+1; internal < sorted.length; internal++) {
          const compare = sorted[internal];
          const compareDate = moment(compare.date, 'YYYY-MM-DD');

          // for bed and breakfasting rule to apply -
          // there should be at least 1 day difference between transactions
          if (sellDate.isSame(compareDate, 'days')) {
            continue;
          }

          // bed and breakfasting rule is valid only for 30 days
          if (sellDate.diff(compareDate, 'days') > 30) {
            break;
          }

          // For bed and breakfasting rule SELL should happen after BUY
          // of same stock transaction withing 30 days of it
          if (compare.direction === 'BUY') {
            // amount to match against breakfasting rule
            const matchedAmount = Math.min(current.amount, compare.amount);
            currentAmount -= matchedAmount;
          }

          // there is no more amount to match
          if (currentAmount !== undefined && currentAmount === 0) {
            break
          }
        }

        // logging unmatched amount
        if (currentAmount > 0) {
          // unmatchedGroups.push(new Transaction());
        }
      }
    });



    return matchedGroups;
  }

  mapByIndex(transactions: Transaction[]): Map<string, Transaction[]> {
    let index_by_index_map: Map<string, Transaction[]> = new Map();
    return transactions.reduce(
      (index, trx) => {
        if (trx === undefined || trx.index === undefined) {
          return index;
        }
        const indexValue = trx.index;
        if (!index.has(indexValue)) {
          const empty: Transaction[] = [];
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

  mapByDate(transactions: Transaction[]): Map<string, Transaction[]> {
    let index_by_date_map: Map<string, Transaction[]> = new Map();
    return transactions.reduce(
      (index, trx) => {
        if (trx === undefined || trx.date === undefined) {
          return index;
        }
        const dateValue = trx.date;
        if (!index.has(dateValue)) {
          const empty: Transaction[] = [];
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

}

function group(portfolio: Portfolio): TransactionGroup[] {
  const group_strategy = new TransactionGroupStrategy(portfolio);
  return group_strategy.groupped();
}

module.exports = {
  group,
  TransactionGroupStrategy,
}
