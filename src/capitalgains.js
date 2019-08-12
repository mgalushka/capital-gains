// @flow

import type currency from "./currency"

type CapitalGainType = {
  amount: number,
  currency: currency,
};

const gains = () => {
  return {
    amount: 100,
    currency: 'GBP',
  }
}

module.exports = gains;
