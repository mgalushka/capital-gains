const portfolio = require("../src/portfolio");
const grouping = require("../src/grouping");

test('basic grouping', () => {
  const p = portfolio.newPortfolio();
  p.add(portfolio.newTransaction(
    'MSFT', 1, 17.9, 'USD', 'BUY', '2019-07-12',
  ));
  p.add(portfolio.newTransaction(
    'MSFT', 1, 21, 'USD', 'SELL', '2019-07-21',
  ));

  expect(grouping.group(p)).toBeNull();
});
