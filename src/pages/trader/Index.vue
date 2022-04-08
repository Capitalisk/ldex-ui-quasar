<template>
  <div class="q-page q-pb-md">
    <div class="row" v-if="currentPrice">
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
                <q-btn
                  label="&#8505;"
                  size="sm"
                  round
                  color="primary"
                  class="q-ml-sm"
                >
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
                <q-btn
                  label="&#8505;"
                  size="sm"
                  round
                  color="primary"
                  class="q-ml-sm"
                >
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
      <div class="col-3">
        <div class="row text-grey-7 q-pa-sm">
          <div class="col">
            Price ({{ sellToken }})
            <q-tooltip>The price {{ sellToken }} is being sold at</q-tooltip>
          </div>
          <div class="col text-right">
            Amount ({{ buyToken }})
            <q-tooltip>The amount of {{ buyToken }} being sold</q-tooltip>
          </div>
          <div class="col text-right">
            Total ({{ buyToken }})
            <q-tooltip>The total amount of {{ buyToken }} being sold</q-tooltip>
          </div>
        </div>
        <div
          class="row text-red q-px-sm"
          v-for="{ price, sizeRemaining } in sellingOffers"
          :key="price"
          :style="`background: linear-gradient(to right, rgb(112, 13, 13) ${
            (sizeRemaining / maxSize.ask) * 100
          }%, rgba(0, 0, 0, 0) 1%);`"
        >
          <div class="col">{{ price }} {{ sellToken }}</div>
          <div class="col text-right">{{ numberToDecimal(sizeRemaining) }}</div>
          <div class="col text-right">
            {{ numberToDecimal(sizeRemaining * price) }}
          </div>
        </div>
        <div class="row text-red q-py-md q-px-sm">
          <div class="col-5">
            <h5 class="q-my-xs">1 {{ buyToken }}</h5>
          </div>
          <div class="col-1"><h5 class="q-my-xs">=</h5></div>
          <div class="col-6 text-right">
            <h5 class="q-my-xs">{{ currentPrice }} {{ sellToken }}</h5>
          </div>
        </div>
        <div class="row text-grey-7 q-pa-sm">
          <div
            class="col"
            style="border-color: rgb(40, 97, 19); border-top: 2px"
          >
            Price ({{ sellToken }})
            <q-tooltip>The price {{ sellToken }} is being bought at</q-tooltip>
          </div>
          <div class="col text-right">
            Amount ({{ sellToken }})
            <q-tooltip>The amount of {{ sellToken }} being bought</q-tooltip>
          </div>
          <div class="col text-right">
            Total ({{ sellToken }})
            <q-tooltip
              >The total amount of {{ sellToken }} being bought</q-tooltip
            >
          </div>
        </div>
        <div
          class="row text-green q-px-sm"
          v-for="{ price, valueRemaining } in buyingOffers"
          :key="price"
          :style="`background: linear-gradient(to right, rgb(40, 97, 19) ${
            (valueRemaining / maxSize.bid) * 100
          }%, rgba(0, 0, 0, 0) 1%);`"
        >
          <div class="col">{{ price }} {{ sellToken }}</div>
          <div class="col text-right">
            {{ numberToDecimal(valueRemaining) }}
          </div>
          <div class="col text-right">
            {{ numberToDecimal(valueRemaining * price) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watchEffect, reactive } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';
import { useStore } from 'src/store';

const store = useStore();
const $q = useQuasar();

const buyingOffers = ref([]);
const sellingOffers = ref([]);
const currentPrice = ref(null);
const recentTransactions = ref({});
const walletAddress = ref();
const maxSize = reactive({
  bid: 0,
  ask: 0,
});

watchEffect(() => {
  if (store.state.activeTab) {
    sellingOffers.value = [];
    buyingOffers.value = [];
    currentPrice.value = null;

    api
      .get('/order-book?depth=20')
      .then(({ data }) => {
        for (let i = 0; i < data.length; i++) {
          const order = data[i];
          if (order.side === 'ask') {
            sellingOffers.value.push(order);
          } else {
            buyingOffers.value.push(order);
          }
        }

        maxSize.ask = Math.max(
          ...sellingOffers.value.map((o) => parseInt(o.sizeRemaining)),
        );
        maxSize.bid = Math.max(
          ...buyingOffers.value.map((o) => parseInt(o.valueRemaining)),
        );
      })
      .catch((err) => {
        console.error(err);
        $q.notify({ message: err.message, color: 'red' });
      });

    api
      .get('/prices/recent')
      .then(({ data }) => {
        currentPrice.value = data[0]?.price;
      })
      .catch((err) => {
        console.error(err);
        $q.notify({ message: err.message, color: 'red' });
      });

    if (walletAddress.value) {
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
    }
  }
});

const marketTab = ref('limit');
const text = ref('4033');
const tab = computed(() => store.state.activeTab);
const buyToken = computed(() => tab.value.split('/')[0].toUpperCase());
const sellToken = computed(() => tab.value.split('/')[1].toUpperCase());
const numberToDecimal = (v) => (v / 100000000).toLocaleString('en-US');
</script>

<style lang="scss" scoped>
.btn-fixed-width {
  width: 200px;
}
</style>
