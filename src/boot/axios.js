import { boot } from 'quasar/wrappers';
import axios from 'axios';

const api = axios.create({ baseURL: 'https://ldex.exchange/dex/lsh-lsk/api' });

export default boot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios;
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api;
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API

  app.config.globalProperties.getOrderBook = async (
    instance,
    orderBookDepth,
  ) => {
    const { data: orderBook } = await instance.get(
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

  app.config.globalProperties.getBidsFromWallet = async (
    instance,
    sourceWalletAddress,
  ) => {
    return (
      await instance.get(
        `/orders/bids?sourceWalletAddress=${encodeURIComponent(
          sourceWalletAddress,
        )}`,
      )
    ).data;
  };

  app.config.globalProperties.getAsksFromWallet = async (
    instance,
    sourceWalletAddress,
  ) => {
    return (
      await instance.get(
        `/orders/asks?sourceWalletAddress=${encodeURIComponent(
          sourceWalletAddress,
        )}`,
      )
    ).data;
  };

  app.config.globalProperties.getPendingTransfers = async (
    instance,
    targetAssetSymbol,
    recipientAddress,
  ) => {
    return (
      await instance.get(
        `/transfers/pending?targetChain=${targetAssetSymbol}&recipientId=${encodeURIComponent(
          recipientAddress,
        )}`,
      )
    ).data;
  };

  app.config.globalProperties.getRecentTransfers = async (
    instance,
    orderId,
  ) => {
    let [takerResult, makerResult, originResult] = await Promise.all([
      instance.get(
        `/transfers/recent?takerOrderId=${encodeURIComponent(orderId)}`,
      ),
      instance.get(
        `/transfers/recent?makerOrderId=${encodeURIComponent(orderId)}`,
      ),
      instance.get(
        `/transfers/recent?originOrderId=${encodeURIComponent(orderId)}`,
      ),
    ]);
    return [...takerResult.data, ...makerResult.data, ...originResult.data];
  };

  app.config.globalProperties.getProcessedHeights = async (instance) => {
    const status = (await instance.get('/status')).data;
    return status.processedHeights;
  };

  app.config.globalProperties.getPriceHistory = async (
    instance,
    offset,
    limit,
  ) => {
    return (await instance.get('/prices/recent')).data;
  };

  app.config.globalProperties.getConfig = async (instance) => {
    return await instance.get(`.env.${process.env.NODE_ENV}.json`);
  };
});

export { axios, api };
