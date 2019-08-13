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
});
