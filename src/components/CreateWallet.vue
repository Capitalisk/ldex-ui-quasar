<template>
  <q-btn label="Create wallet" @click="createWallet" />
</template>

<script setup>
import { useStore } from 'src/store';

const store = useStore();

const loading = ref({});

const generatedWallet = ref(null);

const createWallet = async () => {
  const asset = 'lsk';
  const assetAdapter = store.assetAdapters[asset];

  loading.value[asset] = true;

  const { address, passphrase } = await assetAdapter.createWallet();
  const keyIndex = await this.getKeyIndex(asset, address);

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
