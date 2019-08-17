const gains = require("../src/capitalgains");

test('basic accumulation', () => {
  const g = gains.new_portfolio();
  g.add({
    amount: 10,
    currency: "USD",
    type: "SELL",
  });
  expect(g.transactions.length).toBe(1);

  g.add({
    amount: 15,
    currency: "GBP",
    type: "BUY",
  });
  expect(g.transactions.length).toBe(2);
  expect(g.count()).toBe(2);
});

test('basic balance', () => {
  const g = gains.new_portfolio();
  g.add({
    index: 'MSFT',
    amount: 10,
    price: 12,
    currency: "USD",
    type: "SELL",
  });
  expect(g.transactions.length).toBe(1);

  g.add({
    index: 'MSFT',
    amount: 15,
    price: 3,
    currency: "USD",
    type: "BUY",
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
    type: 'BUY',
  });
  expect(g.transactions.length).toBe(1);

  // js array reduce example: https://jsfiddle.net/pym47ung/1/
  expect(g.balance()).toBe(55.5 * 3);
});
