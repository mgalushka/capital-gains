const gains = require('../src/capitalgains');

test('testing gains amount', () => {
  expect(gains().amount).toBe(100);
});
