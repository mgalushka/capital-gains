const portfolio = require("../src/portfolio");
const grouping = require("../src/grouping");

createTestPortfolio = () => {
  const p = portfolio.newPortfolio();
  p.add(portfolio.newTransaction(
    'MSFT', 1, 17.9, 'USD', 'BUY', '2019-07-12',
  ));
  p.add(portfolio.newTransaction(
    'MSFT', 1, 18, 'USD', 'SELL', '2019-07-12',
  ));
  p.add(portfolio.newTransaction(
    'MSFT', 1, 21, 'USD', 'BUY', '2019-07-21',
  ));
  return p;
}

createComplexPortfolio = () => {
  const p = portfolio.newPortfolio();

  // same day
  p.add(portfolio.newTransaction(
    'MSFT', 18, 1, 'USD', 'SELL', '2019-07-12',
  ));
  p.add(portfolio.newTransaction(
    'MSFT', 17.9, 1, 'USD', 'BUY', '2019-07-12',
  ));

  // 30 days rule
  p.add(portfolio.newTransaction(
    'APPL', 15, 10, 'USD', 'BUY', '2019-01-01',
  ));
  p.add(portfolio.newTransaction(
    'APPL', 16, 5, 'USD', 'SELL', '2019-08-01',
  ));
  p.add(portfolio.newTransaction(
    'APPL', 17, 5, 'USD', 'BUY', '2019-08-17',
  ));

  // holding
  p.add(portfolio.newTransaction(
    'MSFT', 24, 12, 'USD', 'BUY', '2019-06-01',
  )); // same day
  p.add(portfolio.newTransaction(
    'MSFT', 25, 12, 'USD', 'SELL', '2019-09-22',
  ));

  return p;
}

test('basic grouping', () => {
  expect(grouping.group(createTestPortfolio())).toEqual([]);
});

test('testing indexes', () => {
  const strategy = new grouping.TransactionGroupStrategy(createTestPortfolio());
  expect(strategy.transactions.length).toBe(3);
  expect(strategy.indexByDate.size).toBe(2);
  expect(strategy.indexByStock.size).toBe(1);
});

test('same day groups', () => {
  const strategy = new grouping.TransactionGroupStrategy(createTestPortfolio());
  const sameDay = strategy.groupSameDay();
  expect(sameDay.length).toBe(1);

  const trx = sameDay[0];
  expect(trx).toMatchObject({
    index: 'MSFT',
    transactions: [
      ((portfolio.newTransaction('MSFT', 1, 17.9, 'USD', 'BUY', '2019-07-12'): any): Transaction),
      ((portfolio.newTransaction('MSFT', 1, 18, 'USD', 'SELL', '2019-07-12'): any): Transaction),
    ],
    type: "SAME_DAY",
    groupMetadata: {date: "2019-07-12"},
  });
  expect(trx.index).toBe('MSFT');
});

test('test bed and breakfast grouping', () => {
  const strategy = new grouping.TransactionGroupStrategy(createTestPortfolio());
  const bnb = strategy.groupBedAndBreakfasting();
  expect(bnb.length).toBe(0);
});

test('test groupX', () => {
  const strategy = new grouping.TransactionGroupStrategy(createComplexPortfolio());
  const bnb = strategy.groupX();
});

test('test tracking', () => {
  const strategy = new grouping.TransactionGroupStrategy(createComplexPortfolio());
  strategy.track(strategy.transactions);

  // checking consecutive transaction ids
  var id = 0;
  strategy.transactions.map(trx => expect(trx.id).toBe(id++));
});

test('test adjusting', () => {
  const strategy = new grouping.TransactionGroupStrategy(createComplexPortfolio());
  let transactions = strategy.transactions;
  strategy.track(transactions);

  // adjusting transaction with id == 1 ('MSFT', 17.9, 1, 'USD', 'BUY', '2019-07-12')
  // because its amount == 1 - this will remove transaction from the list
  strategy.adjust(transactions, 1, 1);
  var id = 0;
  transactions.map(trx => {
    // removed transaction #1
    if (id === 1) return;
    expect(trx.id).toBe(id++)
  });

  // adjusting transaction with id == 2 by 2 stocks ('APPL', 15, 10, 'USD', 'BUY', '2019-01-01')
  // because its amount == 10 - this will adjust amount to 8 = 10 - 2
  expect(strategy.transactionByID(transactions, 2).amount).toBe(10); // before adjustment
  strategy.adjust(transactions, 2, 2);
  expect(strategy.transactionByID(transactions, 2).amount).toBe(8);  // after adjustment
});
