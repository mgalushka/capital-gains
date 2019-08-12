const gains = require('../src/capitalgains');

test('testing gains amount', () => {
  const g = gains();
  expect(g.amount).toBe(100);
  expect(g.currency).toBe("GBP");
});
