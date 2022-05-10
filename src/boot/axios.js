import { boot } from 'quasar/wrappers';
import axios from 'axios';
import store from 'src/store';

let api = axios.create({
  baseURL: 'http://154.53.44.204:8021',
});

api.interceptors.request.use((r) => {
  store.mutateLoading(true);
  return r;
});

api.interceptors.response.use((r) => {
  store.mutateLoading(false);
  return r;
});

const getOrderBook = async (orderBookDepth) => {
  const { data: orderBook } = await api.get(
    `/order-book?depth=${orderBookDepth}`,
  );
  return orderBook.map((orderLvl) => {
    if (orderLvl.side === 'ask') {
      return {
        ...orderLvl,
        sizeRemaining: Number(orderLvl.sizeRemaining),
      };
    }
    return {
      ...orderLvl,
      valueRemaining: Number(orderLvl.valueRemaining),
    };
  });
};

const getBidsFromWallet = async (sourceWalletAddress) => {
  return (
    await api.get(
      `/orders/bids?sourceWalletAddress=${encodeURIComponent(
        sourceWalletAddress,
      )}`,
    )
  ).data;
};

const getAsksFromWallet = async (sourceWalletAddress) => {
  return (
    await api.get(
      `/orders/asks?sourceWalletAddress=${encodeURIComponent(
        sourceWalletAddress,
      )}`,
    )
  ).data;
};

const getPendingTransfers = async (targetAssetSymbol, recipientAddress) => {
  return (
    await api.get(
      `/transfers/pending?targetChain=${targetAssetSymbol}&recipientId=${encodeURIComponent(
        recipientAddress,
      )}`,
    )
  ).data;
};

const getRecentTransfers = async (orderId) => {
  let [takerResult, makerResult, originResult] = await Promise.all([
    api.get(`/transfers/recent?takerOrderId=${encodeURIComponent(orderId)}`),
    api.get(`/transfers/recent?makerOrderId=${encodeURIComponent(orderId)}`),
    api.get(`/transfers/recent?originOrderId=${encodeURIComponent(orderId)}`),
  ]);
  return [...takerResult.data, ...makerResult.data, ...originResult.data];
};

const getProcessedHeights = async () => {
  const status = (await api.get('/status')).data;
  return status.processedHeights;
};

const getStatus = async () => {
  return (await api.get('/status')).data;
};

const getPriceHistory = async (offset, limit) => {
  return (await api.get('/prices/recent')).data;
};

const getConfig = async (api) => {
  return await api.get(`.env.${process.env.NODE_ENV}.json`);
};

export default boot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios;
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api;
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API

  app.config.globalProperties.getOrderBook = getOrderBook;
  app.config.globalProperties.getBidsFromWallet = getBidsFromWallet;
  app.config.globalProperties.getAsksFromWallet = getAsksFromWallet;
  app.config.globalProperties.getPendingTransfers = getPendingTransfers;
  app.config.globalProperties.getRecentTransfers = getRecentTransfers;
  app.config.globalProperties.getProcessedHeights = getProcessedHeights;
  app.config.globalProperties.getPriceHistory = getPriceHistory;
  app.config.globalProperties.getConfig = getConfig;
  app.config.globalProperties.getStatus = getStatus;
});

const changeBaseURL = (baseURL) => (api.defaults.baseURL = baseURL);

export {
  axios,
  api,
  changeBaseURL,
  getOrderBook,
  getBidsFromWallet,
  getAsksFromWallet,
  getPendingTransfers,
  getRecentTransfers,
  getProcessedHeights,
  getPriceHistory,
  getConfig,
  getStatus,
};
