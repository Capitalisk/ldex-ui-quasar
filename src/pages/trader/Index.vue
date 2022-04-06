<template>
  <div class="q-page q-pb-md">
    <div class="row">
      <div class="col-3">
        <div class="row text-grey-7 q-pa-sm">
          <div class="col">Price ({{ buyToken }})</div>
          <div class="col text-right">Total ({{ sellToken }}) {{ tab }}</div>
        </div>
        <div
          class="row text-red q-px-sm"
          v-for="{ price, sizeRemaining } in sellingOffers"
          :key="price"
        >
          <div class="col">{{ price }}</div>
          <div class="col text-right">{{ sizeRemaining }}</div>
        </div>
        <div class="row text-red q-py-md q-px-sm">
          <div class="col">
            <h5>{{ currentPrice }} {{ buyToken }}</h5>
          </div>
        </div>
        <div
          class="row text-green q-px-sm"
          v-for="{ price, sizeRemaining } in buyingOffers"
          :key="price"
        >
          <div class="col">{{ price }}</div>
          <div class="col text-right">{{ sizeRemaining }}</div>
        </div>
      </div>
      <div class="col">
        <div class="row q-pa-xl">{{ recentTransactions }}</div>
        <div class="row q-pa-md">
          <q-tabs v-model="marketTab">
            <q-tab name="limit">Limit</q-tab>
            <q-tab name="market">Market</q-tab>
            <q-tab name="my-orders">My Orders</q-tab>
          </q-tabs>
        </div>
        <div class="row q-pa-md q-gutter-md">
          <div class="col">
            <div class="row q-py-md">
              <div class="col">
                <strong>Buy {{ buyToken }}</strong>
                <q-btn label="&#8505;" rounded color="primary" class="q-ml-sm">
                  <q-tooltip
                    anchor="center right"
                    self="center left"
                    :offset="[10, 10]"
                  >
                    The BUY panel lets you convert your
                    {{ buyToken }} into {{ sellToken }}.
                  </q-tooltip>
                </q-btn>
              </div>
              <div class="col text-grey-7 q-my-auto text-right">1280 LSK</div>
            </div>
            <div class="row q-gutter-md">
              <div class="col">
                <q-input filled outlined v-model="text" label="rounded" />
              </div>
              <div class="col">
                <q-input filled outlined v-model="text" label="rounded" />
              </div>
            </div>
            <div class="row q-py-md">
              <div class="col text-center">
                <q-btn
                  align="center"
                  class="btn-fixed-width"
                  rounded
                  outline
                  color="green"
                  label="Buy LSH"
                />
              </div>
            </div>
          </div>
          <div class="col">
            <div class="row q-py-md">
              <div class="col">
                <strong>Sell {{ sellToken }}</strong>
                <q-btn label="&#8505;" rounded color="primary" class="q-ml-sm">
                  <q-tooltip
                    anchor="center right"
                    self="center left"
                    :offset="[10, 10]"
                  >
                    The SELL panel lets you convert your
                    {{ sellToken }} into {{ buyToken }}.
                  </q-tooltip>
                </q-btn>
              </div>
              <div class="col text-grey-7 q-my-auto text-right">1280 LSH</div>
            </div>
            <div class="row q-gutter-md">
              <div class="col">
                <q-input filled outlined v-model="text" label="rounded" />
              </div>
              <div class="col">
                <q-input filled outlined v-model="text" label="rounded" />
              </div>
            </div>
            <div class="row q-py-md">
              <div class="col text-center">
                <q-btn
                  align="center"
                  class="btn-fixed-width"
                  rounded
                  outline
                  color="red"
                  label="Sell LSH"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';
import { useStore } from 'src/store';

const store = useStore();
const $q = useQuasar();

const buyingOffers = ref([]);
const sellingOffers = ref([]);
const currentPrice = ref(null);
const recentTransactions = ref({});

api
  .get('/order-book?depth=20')
  .then(({ data }) => {
    for (let i = 0; i < data.length; i++) {
      const order = data[i];
      if (order.side === 'ask') {
        sellingOffers.value.push({
          ...order,
          sizeRemaining: (order.sizeRemaining / 100000000).toLocaleString(
            'en-US',
          ),
        });
      } else {
        buyingOffers.value.push({
          ...order,
          sizeRemaining: (order.sizeRemaining / 100000000).toLocaleString(
            'en-US',
          ),
        });
      }
    }
  })
  .catch((err) => $q.notify({ message: err.message, color: 'red' }));

api
  .get('/prices/recent')
  .then(({ data }) => {
    currentPrice.value = data[0].price;
  })
  .catch((err) => $q.notify({ message: err.message, color: 'red' }));

api
  .get('/status')
  .then(({ data }) => {
    const chains = Object.keys(data.chains);
    for (let i = 0; i < chains.length; i++) {
      const chain = chains[i];
      const token = data.chains[chain];
      api
        .get(
          `https://ldex.exchange/chain/lsh/api/transactions?senderId=${token.walletAddress}&limit=100&sort=timestamp:desc`,
        )
        .then(({ data: d }) => {
          console.log(d);
          recentTransactions.value[chain] = d;
        })
        .catch((err) => {
          console.error(err);
          $q.notify({ message: err.message, color: 'red' });
        });
    }
  })
  .catch((err) => {
    console.error(err);
    $q.notify({ message: err.message, color: 'red' });
  });

const marketTab = ref('limit');
const text = ref('4033');
const tab = computed(() => store.state.activeTab);
const buyToken = computed(() => tab.value.split('/')[0].toUpperCase());
const sellToken = computed(() => tab.value.split('/')[1].toUpperCase());
</script>

<style lang="scss" scoped>
.btn-fixed-width {
  width: 200px;
}
</style>
