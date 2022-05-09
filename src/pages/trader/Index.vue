<template>
  <q-page>
    <div class="row absolute-bottom absolute-top" v-if="currentPrice">
      <div class="col">
        <div class="row" ref="ldexChartRef"></div>
      </div>
      <div
        class="col-3 full-height ldex-border-top ldex-border-left ldex-border-right"
      >
        <!-- <div class="full-height column no-wrap justify-center"> -->
        <div class="row text-grey-7 q-pa-sm">
          <div class="col">
            Price
            <q-chip size="sm" square>{{ baseToken }}</q-chip>
            <q-tooltip>The price {{ baseToken }} is being sold at</q-tooltip>
          </div>
          <div class="col text-right">
            Amount
            <q-chip size="sm" square>{{ originToken }}</q-chip>
            <q-tooltip>The amount of {{ originToken }} being sold</q-tooltip>
          </div>
          <div class="col text-right">
            Total
            <q-chip size="sm" square>{{ originToken }}</q-chip>
            <q-tooltip
              >The total amount of {{ originToken }} being sold</q-tooltip
            >
          </div>
        </div>
        <div
          class="row text-red q-px-sm text-caption"
          v-for="{ price, sizeRemaining } in sellingOffers"
          :key="price"
          :style="`background: linear-gradient(to right, rgb(112, 13, 13) ${
            (sizeRemaining / maxSize.ask) * 100
          }%, rgba(0, 0, 0, 0) 1%);`"
        >
          <div class="col">{{ price }} {{ baseToken }}</div>
          <div class="col text-right">
            {{ numberToDecimal(sizeRemaining) }}
          </div>
          <div class="col text-right">
            {{ numberToDecimal(sizeRemaining * price) }}
          </div>
        </div>
        <div class="row text-red q-py-md q-px-sm">
          <div class="col-5">
            <h6 class="q-my-xs">1 {{ originToken }}</h6>
          </div>
          <div class="col-2 text-center">
            <h6 class="q-my-xs">=</h6>
          </div>
          <div class="col-5 text-right">
            <h6 class="q-my-xs">{{ currentPrice }} {{ baseToken }}</h6>
          </div>
        </div>
        <div class="row text-grey-7 q-pa-sm">
          <div
            class="col"
            style="border-color: rgb(40, 97, 19); border-top: 2px"
          >
            Price
            <q-chip size="sm" square>{{ baseToken }}</q-chip>
            <q-tooltip>The price {{ baseToken }} is being bought at</q-tooltip>
          </div>
          <div class="col text-right">
            Amount
            <q-chip size="sm" square>{{ baseToken }}</q-chip>
            <q-tooltip>The amount of {{ baseToken }} being bought</q-tooltip>
          </div>
          <div class="col text-right">
            Total
            <q-chip size="sm" square>{{ baseToken }}</q-chip>
            <q-tooltip>
              The total amount of {{ baseToken }} being bought
            </q-tooltip>
          </div>
        </div>
        <div
          class="row text-green q-px-sm text-caption"
          v-for="{ price, valueRemaining } in buyingOffers"
          :key="price"
          :style="`background: linear-gradient(to right, rgb(40, 97, 19) ${
            (valueRemaining / maxSize.bid) * 100
          }%, rgba(0, 0, 0, 0) 1%);`"
        >
          <div class="col">{{ price }} {{ baseToken }}</div>
          <div class="col text-right">
            {{ numberToDecimal(valueRemaining) }}
          </div>
          <div class="col text-right">
            {{ numberToDecimal(valueRemaining * price) }}
          </div>
        </div>
        <!-- </div> -->
      </div>
      <div class="col-3 ldex-border-top">
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
                  {{ oppositeToken }}
                </q-chip>
              </template>
            </q-input>
            <div>
              Expected price:
              {{ expectedPrice }}
              {{ token }}
            </div>
            <!-- This button should be replace by connect wallet if the user isn't signed in for the transaction to take effect -->
            <!-- <q-btn
              :color="method === 'buy' ? 'positive' : 'negative'"
              rounded
              class="full-width"
              :label="`${method} ${oppositeToken}`"
            /> -->
            <q-btn
              v-if="!asset"
              :color="method === 'buy' ? 'positive' : 'negative'"
              :label="`Connect ${token}`"
              icon-right="mdi-wallet"
              rounded
              outline
              xs
              dense
              @click="wallets[token] = true"
              class="full-width"
            >
              <q-dialog v-model="wallets[token]">
                <Login :token="token" @logged-in="wallets[token] = false" />
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
              @click="wallets[token] = true"
              class="full-width"
            />
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, watchEffect, reactive, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'src/store';
import { useQuasar } from 'quasar';
import gsap from 'gsap';

import { api } from 'src/boot/axios';

import Login from '../Login.vue';

const $q = useQuasar();
const route = useRoute();
const store = useStore();

const buyingOffers = ref([]);
const sellingOffers = ref([]);
const currentPrice = ref(null);
const recentTransactions = ref({});
const walletAddress = ref();
const maxSize = reactive({
  bid: 0,
  ask: 0,
});
const wallets = reactive({});
const priceHistory = ref([]);
const method = ref('buy');
const amount = ref(null);
const marketConfig = computed(
  () => store.state.config.assets[route.query.market.split('/')[1]],
);
const token = computed(() =>
  method.value === 'buy' ? baseToken.value : originToken.value,
);
const oppositeToken = computed(() =>
  method.value === 'sell' ? baseToken.value : originToken.value,
);
const asset = computed(() => store.state.activeAssets[token.value]);

const ldexChartRef = ref();

const tweened = reactive({
  number: 0,
});

watch(amount, (n) => {
  gsap.to(tweened, { duration: 0.5, number: Number(n) || 0 });
});

const expectedPrice = computed(() => {
  const value =
    method.value === 'buy'
      ? tweened.number.toFixed(2) * currentPrice.value
      : tweened.number.toFixed(2) / currentPrice.value;

  return value.toFixed(2);
});

watchEffect(() => {
  if (route.query.market) {
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
        const unitValue = Number(marketConfig.value.unitValue);
        const timeMultiplier = Number(marketConfig.value.timeMultiplier) || 1;
        const timeOffset = Number(marketConfig.value.timeOffset) || 0;

        console.log(unitValue, timeMultiplier, timeOffset);

        currentPrice.value = data[0]?.price;
        priceHistory.value = data;

        const volumeDisplayHeightRatio = 100000;

        const maxVolume = data.reduce(
          (accumulator, entry) =>
            Number(entry.volume) > accumulator
              ? Number(entry.volume)
              : accumulator,
          -Infinity,
        );
        const maxPrice = data.reduce(
          (accumulator, entry) =>
            Number(entry.price) > accumulator
              ? Number(entry.price)
              : accumulator,
          -Infinity,
        );

        const chartData = data.map((entry) => [
          new Date(
            Math.round(entry.baseTimestamp * timeMultiplier + timeOffset),
          ).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
          }),
          (Math.round((Number(entry.volume) * 100) / maxVolume) *
            maxPrice *
            volumeDisplayHeightRatio) /
            unitValue,
          entry.price,
        ]);

        console.log(chartData[0]);

        google.charts.load('current', { packages: ['corechart'] });
        google.charts.setOnLoadCallback(drawVisualization);

        function drawVisualization() {
          // Some raw data (not necessarily accurate)
          const data = google.visualization.arrayToDataTable([
            ['Time', 'Volume', 'Price'],
            ...chartData.reverse(),
          ]);

          const options = {
            // title: 'Monthly Coffee Production by Country',
            seriesType: 'bars',
            series: { 1: { type: 'line' } },
            legend: 'none',
            height: 600,
            backgroundColor: {
              fillOpacity: 0,
            },
            hAxis: {
              textStyle: { color: '#FFF' },
              gridlines: {
                color: '#000',
              },
            },
            vAxis: {
              textStyle: { color: '#FFF' },
              gridlines: {
                interval: 0,
              },
            },
            chartArea: {
              left: 5,
              top: 20,
              width: '100%',
              height: '350',
            },
            bar: { groupWidth: '100%' },
            colors: ['#0366d6', '#FFF'],
          };

          const chart = new google.visualization.ComboChart(ldexChartRef.value);
          chart.draw(data, options);
        }
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

const amountRef = ref(null);
const marketTab = ref('market');
const tab = computed(() => route.query.market);
const originToken = computed(() => tab.value?.split('/')[0].toUpperCase());
const baseToken = computed(() => tab.value?.split('/')[1].toUpperCase());
const numberToDecimal = (v) => (v / 100000000).toLocaleString('en-US');
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
</script>

<style lang="scss" scoped>
@import '../../css/quasar.variables.scss';

.btn-fixed-width {
  width: 200px;
}

.ldex-border {
  &-top {
    border-top: 1px solid $border-color;
  }
  &-bottom {
    border-bottom: 1px solid $border-color;
  }
  &-right {
    border-right: 1px solid $border-color;
  }
  &-left {
    border-left: 1px solid $border-color;
  }
}
</style>
