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
  expect(strategy.groupSameDay().length).toBe(1);
});
