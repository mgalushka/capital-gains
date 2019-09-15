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
  // if SELL - match against: 1. same day; 2. 30 days rule; 3 - match against holding and adjust holding correspondingly
  // remove matched transactions from transaction pool
  groupX(): TransactionGroup[] {
    let matches: TransactionGroup[] = [];
    let tracked = this.track(
      this.transactions.map(tr => tr.clone()).sort(this.asc),
    );

    const indexByDate = this.mapByDate(tracked);
    var sortedIndexByDate: Map<string, Map<string, Transaction[]>> = new Map();
    indexByDate.forEach((transactions: Transaction[], date: string, map) => {
      let emptyTransactions: Map<string, Transaction[]> = new Map();
      sortedIndexByDate.set(date, emptyTransactions);
      const sortedTransactions = transactions.sort(this.asc);
      sortedTransactions.forEach(transaction => {
        let byDate = sortedIndexByDate.get(date);
        if (byDate !== undefined) {
          const index = transaction.index;
          if (index !== undefined) {
            if (!byDate.has(index)) {
              let newTransactionsArr: Transaction[] = [];
              newTransactionsArr.push(transaction);
              byDate.set(index, newTransactionsArr);
            } else {
              let currentTransactions = byDate.get(index);
              if (currentTransactions !== undefined) {
                currentTransactions.push(transaction);
              }
            }
          }
        }
      });
    });

    console.log(sortedIndexByDate);

    // all current holdings
    var holdings: Map<string, Holding> = new Map();

    for (let i = 0; i < tracked.length; i++) {
      let currentTransaction = tracked[i];

      // find same date
      const id = currentTransaction.id;
      const date = currentTransaction.date;
      const index = currentTransaction.index;
      if (sortedIndexByDate.has(date)) {
        let indexMap = sortedIndexByDate.get(date);
        if (indexMap !== undefined && indexMap.has(index)) {
          let transactions = indexMap.get(index);
          if (transactions === undefined) continue;
          transactions.map(trx => {
            if (trx === undefined) return;
            if (trx.id !== id) {
              if (trx.direction !== currentTransaction.direction) {
                const amountMatched = Math.min(trx.amount, currentTransaction.amount);
                const group = {
                    index: index,
                    transactions: [currentTransaction.clone(), trx.clone()],
                    type: "SAME_DAY",
                    groupMetadata: {date: date},
                };
                matches.push(group);
                if (trx.id !== undefined && trx.id !== null && id !== undefined && id !== null) {
                  this.adjust(tracked, trx.id, amountMatched);
                  this.adjust(tracked, id, amountMatched);
                }
              }
            }
          });
        }
      }
    }

    console.log(matches);
    return matches;
  }

  // add unique identifier to every transaction to be able to distinguish
  track(transactions: Transaction[]): Transaction[] {
    let counter = 0;
    return transactions.map(transaction => {
      transaction.id = counter;
      counter++;
      return transaction;
    });
  }

  // adjust amount for transaction with specific `id`
  adjust(transactions: Transaction[], id: number, amount: number): void {
    for (let i = 0; i < transactions.length; i++) {
      let currentTransaction = transactions[i];
      if (currentTransaction.id === id) {
        if (currentTransaction.amount <= amount) {
          transactions.splice(i, 1);
          break;
        } else {
          currentTransaction.amount -= amount;
        }
      }
    }
  }

  transactionByID(transactions: Transaction[], id: number): ?Transaction {
    for (let i = 0; i < transactions.length; i++) {
      const currentTransaction = transactions[i];
      if (currentTransaction.id === id) {
        return currentTransaction;
      }
    }
    return null;
  }

  asc(a: Transaction, b: Transaction): number {
    const am = moment(a.date, 'YYYY-MM-DD');
    const bm = moment(b.date, 'YYYY-MM-DD');
    if (moment(am).isBefore(bm)) return -1;
    if (moment(am).isAfter(bm)) return 1;
    if (a.direction === b.direction) return 0;
    if (a.direction === 'BUY') return -1;
    else return 1;
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
