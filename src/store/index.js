import { reactive, readonly, computed } from 'vue';

import LiskV3Adapter from 'ldex-ui-lisk-v3-adapter';
import LiskAdapter from 'ldex-ui-lisk-adapter';
import LDPoSAdapter from 'ldex-ui-ldpos-adapter';

import config from '../../.env.production.json';

export const adapters = {
  lisk3: LiskV3Adapter,
  lisk: LiskAdapter,
  ldpos: LDPoSAdapter,
};
// TODO: Implement pending order
//

const state = reactive({
  config,
  configurationLoaded: false,
  configuration: {},
  orderBookData: {
    orders: [],
    bids: [],
    asks: [],
    maxSize: { bid: 0, ask: 0 },
  },
  activeAssets: [],
  // new, activeMarket string for selecting the active market out of the configuration object.
  activeMarket: '',
  enabledAssets: [],
  priceHistory: [],
  displaySigninModal: false,
  displayLeaveWarning: false,
  maxBid: 0,
  minAsk: 0,
  lastTradePrice: null,
  baseAssetBalance: null,
  quoteAssetBalance: null,
  yourOrders: [],
  // to prevent cross-chain replay attacks, the user can specify a key for each chain that they are trading on.
  // the address will be used when the asset is being used as the destination chain.
  notifications: [],
  keys: {},
  assetAdapters: {},
  isLoadingWallet: {},
  loading: false,
});

const store = {
  state: readonly(state),
  assetNames: computed(() => Object.keys(state.config.assets)),
  marketNames: computed(() => Object.keys(state.config.markets)),
  mutateLoading: (v) => (state.loading = v),
};

for (const a of store.assetNames.value) {
  const { adapter } = store.state.config.assets[a];
  const cfg = { chainSymbol: a, ...adapter };
  const AssetAdapter = adapters[adapter.type];
  if (!AssetAdapter) {
    throw new Error(`The ${adapter.type} adapter type is not supported`);
  }
  const assetAdapter = new AssetAdapter(cfg);
  state.assetAdapters[a] = assetAdapter;
}

export default store;

export const useStore = () => store;
