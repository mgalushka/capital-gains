const portfolio = require("../src/portfolio");

test('basic accumulation', () => {
  const g = portfolio.newPortfolio();
  g.add(portfolio.newTransaction(
    'MSFT', 1, 17.9, 'USD', 'BUY', '2019-07-12',
  ));
  expect(g.transactions.length).toBe(1);

  const tr: gains.Transaction = {
    idex: 'AAPL',
    amount: 15,
    price: 1,
    currency: "GBP",
    direction: "BUY",
    date: '2019-07-11',
  }
  g.add(tr);

  expect(g.transactions.length).toBe(2);
  expect(g.count()).toBe(2);
});

test('basic balance', () => {
  const g = portfolio.newPortfolio();
  g.add({
    index: 'MSFT',
    amount: 10,
    price: 12, // cost = 10 * 12 = 120
    currency: "USD",
    direction: "SELL",
  });
  expect(g.transactions.length).toBe(1);

  g.add({
    index: 'MSFT',
    amount: 15,
    price: 3, // cost = 15 * 3 = 45
    currency: "USD",
    direction: "BUY",
  });

  // js array reduce example: https://jsfiddle.net/pym47ung/1/
  expect(g.balance()).toBe(45 - 120);
});

test('new format', () => {
  const g = portfolio.newPortfolio();
  const tr: portfolio.Transaction = {
    index: 'MSFT',
    price: 55.5,
    amount: 3,
    currency: 'USD',
    direction: 'BUY',
    date: '2019-07-11',
  }
  g.add(tr);
  expect(g.transactions.length).toBe(1);
  expect(g.balance()).toBe(55.5 * 3);
});

test('clone', () => {
  const g = portfolio.newPortfolio();
  const tr: portfolio.Transaction =
    portfolio.newTransaction('MSFT', 1, 17.9, 'USD', 'SELL', '2019-07-30')
  g.add(tr);
  const tr2 = tr.clone();
  tr2.index = 'APPL';

  expect(tr2.index).not.toBe(tr.index);
});
