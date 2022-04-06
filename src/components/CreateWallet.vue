<template>
  <q-btn label="Create wallet" @click="createWallet" />
</template>

<script setup>
import { useStore } from 'src/store';
import { ref } from 'vue';

const store = useStore();

const loading = ref({});

const generatedWallet = ref(null);

const getKeyIndex = async (asset, address) => {
  if (!address) {
    return '';
  }
  const assetAdapter = store.state.assetAdapters[asset];
  if (!address.length || !assetAdapter.getAccountNextKeyIndex) {
    return '';
  }
  let keyIndex;
  try {
    keyIndex = await assetAdapter.getAccountNextKeyIndex({ address });
  } catch (error) {}
  return keyIndex || 0;
};

const createWallet = async () => {
  const asset = 'clsk';
  const assetAdapter = store.state.assetAdapters[asset];

  loading.value[asset] = true;

  const { address, passphrase } = await assetAdapter.createWallet();
  const keyIndex = await getKeyIndex(asset, address);

  loading.value[asset] = false;

  // await this.setState((prevState) => ({
  //   passphrases: {
  //     ...prevState.passphrases,
  //     [asset]: passphrase,
  //   },
  //   addresses: {
  //     ...prevState.addresses,
  //     [asset]: address,
  //   },
  //   keyIndexes: {
  //     ...prevState.keyIndexes,
  //     [asset]: keyIndex,
  //   },
  //   isLoading: this.isDataLoading(),
  // }));

  console.log(address, passphrase, keyIndex);

  // if (this.props.walletGenerated) {
  //   this.props.walletGenerated(address, passphrase);
  // }
};
</script>

<style lang="scss" scoped></style>
