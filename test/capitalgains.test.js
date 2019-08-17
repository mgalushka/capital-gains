const gains = require("../src/capitalgains");

test('basic accumulation', () => {
  const g = gains.new_portfolio();
  g.add(gains.new_transaction(
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
  const g = gains.new_portfolio();
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
  const g = gains.new_portfolio();
  g.add({
    index: 'MSFT',
    price: 55.5,
    amount: 3,
    currency: 'USD',
    direction: 'BUY',
  });
  expect(g.transactions.length).toBe(1);

  // js array reduce example: https://jsfiddle.net/pym47ung/1/
  expect(g.balance()).toBe(55.5 * 3);
});
