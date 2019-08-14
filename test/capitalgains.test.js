const gains = require("../lib/capitalgains");

test('basic accumulation', () => {
  const g = gains();
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
  const g = gains();
  g.add({
    amount: 10,
    currency: "USD",
    type: "SELL",
  });
  expect(g.transactions.length).toBe(1);

  g.add({
    amount: 15,
    currency: "USD",
    type: "BUY",
  });

  // js array reduce example: https://jsfiddle.net/pym47ung/1/
  expect(g.balance()).toBe(5);
});
