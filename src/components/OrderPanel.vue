<template>
  <div>
    <div class="row justify-center q-pa-md">
      <q-tabs v-model="marketTab">
        <q-tab name="market">Market</q-tab>
        <q-tab name="limit">Limit</q-tab>
      </q-tabs>
    </div>
    <div class="row q-pa-md">
      <div class="col q-gutter-y-md">
        <q-btn-toggle
          v-model="method"
          no-caps
          rounded
          unelevated
          :toggle-color="method === 'buy' ? 'positive' : 'negative'"
          :text-color="method === 'buy' ? 'negative' : 'positive'"
          spread
          :options="[
            { label: 'Sell', value: 'sell' },
            { label: 'Buy', value: 'buy' },
          ]"
          @click="focusAmount"
        />
        <p>Amount</p>
        <q-input
          :color="method === 'buy' ? 'positive' : 'negative'"
          dense
          rounded
          outlined
          ref="amountRef"
          :model-value="amount"
          @update:model-value="updateAmount"
        >
          <template v-slot:append>
            <q-chip size="sm" square>
              {{ sellMarket.toUpperCase() }}
            </q-chip>
          </template>
        </q-input>
        <div>
          Expected price:
          {{ expectedPrice }}
          {{ token }}<br />
          Expected fees: {{ fees[buyMarket] }}
        </div>
        <!-- This button should be replace by connect wallet if the user isn't signed in for the transaction to take effect -->
        <!-- <q-btn
              :color="method === 'buy' ? 'positive' : 'negative'"
              rounded
              class="full-width"
              :label="`${method} ${sellMarket}`"
            /> -->
        <q-btn
          v-if="!asset"
          :color="method === 'buy' ? 'positive' : 'negative'"
          :label="`Connect ${buyMarket}`"
          icon-right="mdi-wallet"
          rounded
          outline
          xs
          dense
          @click="wallets[buyMarket] = true"
          class="full-width"
        >
          <q-dialog v-model="wallets[buyMarket]">
            <Login :token="buyMarket" @logged-in="loggedIn" />
          </q-dialog>
        </q-btn>
        <q-btn
          v-else
          :color="method === 'buy' ? 'positive' : 'negative'"
          :label="method"
          rounded
          outline
          xs
          dense
          @click="wallets[buyMarket] = true"
          class="full-width"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, watch, computed } from 'vue';
import gsap from 'gsap';

import Login from './Login.vue';
import { api, getStatus } from 'src/boot/axios';
import { useRoute } from 'vue-router';
import { useStore } from 'src/store';
import { useQuasar } from 'quasar';

const props = defineProps({ currentPrice: { type: Number, required: true } });

const route = useRoute();
const store = useStore();
const $q = useQuasar();

const marketTab = ref('market');
const amount = ref(null);
const fees = ref({});
const method = ref('buy');
const recentTransactions = ref({});
const wallets = reactive({});
const tweened = reactive({
  number: 0,
});

const amountRef = ref(null);

const originToken = computed(() => route.query.market?.split('/')[0]);
const baseToken = computed(() => route.query.market?.split('/')[1]);
const buyMarket = computed(() =>
  method.value === 'buy' ? baseToken.value : originToken.value,
);
const sellMarket = computed(() =>
  method.value === 'sell' ? baseToken.value : originToken.value,
);
const asset = computed(() => store.state.activeAssets[buyMarket.value]);

watch(amount, (n) => {
  gsap.to(tweened, { duration: 0.5, number: Number(n) || 0 });
});

const expectedPrice = computed(() => {
  const value =
    method.value === 'buy'
      ? tweened.number.toFixed(2) * props.currentPrice
      : tweened.number.toFixed(2) / props.currentPrice;

  return value.toFixed(2);
});

onMounted(async () => {
  // Get fees
  const cfg = await getStatus();
  const baseChain = cfg.chains[baseToken.value];
  const originChain = cfg.chains[originToken.value];

  const baseChainFee =
    Number(baseChain.exchangeFeeBase) /
    Number(store.state.config.assets[baseToken.value].unitValue);
  const originChainFee =
    Number(originChain.exchangeFeeBase) /
    Number(store.state.config.assets[originToken.value].unitValue);
  fees.value = {
    [baseToken.value]: baseChainFee,
    [originToken.value]: originChainFee,
  };
});

const focusAmount = () => {
  amount.value = null;
  amountRef.value.focus();
};

const updateAmount = (v) =>
  Number.isNaN(parseInt(v))
    ? (amount.value = null)
    : (amount.value = parseInt(v));

watch(
  () => amountRef.value,
  (n) => {
    n?.focus();
  },
);

const loggedIn = async () => {
  try {
    wallets[buyMarket] = false;

    const data = await getStatus();
    console.log(data);
    const chains = Object.keys(data.chains);
    for (let i = 0; i < chains.length; i++) {
      const chain = chains[i];
      const token = data.chains[chain];
      const url = `https://ldex.exchange/chain/lsh/api/transactions?senderId=${token.walletAddress}&limit=100&sort=timestamp:desc`;

      console.log(url);

      const { data: d } = await api.get(url);
      recentTransactions.value[chain] = d;
    }
  } catch (err) {
    console.error(err);
    $q.notify({ message: err.message, color: 'red' });
  }
};
</script>

<style lang="scss" scoped></style>
