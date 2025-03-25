const CoinGeckoSV = {
  simple: {
    price: 'simple_price',
  },
  coins: {
    regular: 'coins',
    contract: 'coins_contract',
    list: 'coins_list',
  },
};
const PairDetailSV = {
  tradeHistory: 'th',
  chartHistory: 'ch',
  pairReaction: 'pr',
  pairReactVote: 'prv',
};

const PairSV = {
  pairsByQuery: 'pbq',
  pairs: 'pairs',
  pairInfo: 'pi',
};

enum USERS_ENDPOINT {
  SP_PAIRS = 'list-supported-pairs',
  HISTORY = 'history',
  DAILY_QUOTA = 'daily-quota',
  BRIDGE = 'bridge',
  PROTOCOL_FEE = 'protocol-fee',
  PRICE_USD = 'price-usd',
  PROOF_OF_ASSETS = 'proof-of-assets',
  EXPECTED_TIMES = 'estimate',
}

enum PROOF_ENDPOINT {
  USER_LOCK = 'user-lock',
  USER_LOCK_CHECK_JOB = 'user-lock/check',
}

export { CoinGeckoSV, PairDetailSV, PairSV, USERS_ENDPOINT, PROOF_ENDPOINT };
