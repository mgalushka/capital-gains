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
  const strategy = new grouping.TransactionGroupStrategy(createTestPortfolio());
  const bnb = strategy.groupX();
});
