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
            <q-chip size="sm" square>{{ sellToken }}</q-chip>
            <q-tooltip>The price {{ sellToken }} is being sold at</q-tooltip>
          </div>
          <div class="col text-right">
            Amount
            <q-chip size="sm" square>{{ buyToken }}</q-chip>
            <q-tooltip>The amount of {{ buyToken }} being sold</q-tooltip>
          </div>
          <div class="col text-right">
            Total
            <q-chip size="sm" square>{{ buyToken }}</q-chip>
            <q-tooltip>The total amount of {{ buyToken }} being sold</q-tooltip>
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
          <div class="col">{{ price }} {{ sellToken }}</div>
          <div class="col text-right">
            {{ numberToDecimal(sizeRemaining) }}
          </div>
          <div class="col text-right">
            {{ numberToDecimal(sizeRemaining * price) }}
          </div>
        </div>
        <div class="row text-red q-py-md q-px-sm">
          <div class="col-5">
            <h6 class="q-my-xs">1 {{ buyToken }}</h6>
          </div>
          <div class="col-2 text-center">
            <h6 class="q-my-xs">=</h6>
          </div>
          <div class="col-5 text-right">
            <h6 class="q-my-xs">{{ currentPrice }} {{ sellToken }}</h6>
          </div>
        </div>
        <div class="row text-grey-7 q-pa-sm">
          <div
            class="col"
            style="border-color: rgb(40, 97, 19); border-top: 2px"
          >
            Price
            <q-chip size="sm" square>{{ sellToken }}</q-chip>
            <q-tooltip>The price {{ sellToken }} is being bought at</q-tooltip>
          </div>
          <div class="col text-right">
            Amount
            <q-chip size="sm" square>{{ sellToken }}</q-chip>
            <q-tooltip>The amount of {{ sellToken }} being bought</q-tooltip>
          </div>
          <div class="col text-right">
            Total
            <q-chip size="sm" square>{{ sellToken }}</q-chip>
            <q-tooltip>
              The total amount of {{ sellToken }} being bought
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
          <div class="col">{{ price }} {{ sellToken }}</div>
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
                  {{ method === 'buy' ? sellToken : buyToken }}
                </q-chip>
              </template>
            </q-input>
            <div>
              Expected price:
              {{
                method === 'buy' ? amount * currentPrice : amount / currentPrice
              }}
              {{ method === 'buy' ? buyToken : sellToken }}
            </div>
            <!-- This button should be replace by connect wallet if the user isn't signed in for the transaction to take effect -->
            <!-- <q-btn
              :color="method === 'buy' ? 'positive' : 'negative'"
              rounded
              class="full-width"
              :label="`${method} ${method === 'buy' ? buyToken : sellToken}`"
            /> -->
            <q-btn
              :color="method === 'buy' ? 'positive' : 'negative'"
              :label="`Connect ${method === 'buy' ? sellToken : buyToken}`"
              icon-right="mdi-wallet"
              rounded
              outline
              xs
              dense
              @click="wallets[sellToken] = true"
              class="full-width"
            >
              <q-dialog v-model="wallets[sellToken]">
                <Login :token="sellToken" />
              </q-dialog>
            </q-btn>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, watchEffect, reactive, onMounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import { GoogleCharts } from 'google-charts';

import { api } from 'src/boot/axios';
import { useStore } from 'src/store';

import Login from '../Login.vue';

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
const wallets = reactive({});
const priceHistory = ref([]);
const method = ref('buy');
const amount = ref(null);

const ldexChartRef = ref();

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
        priceHistory.value = data;

        const chartData = data.map((e) => [e.baseTimestamp, e.price]);

        //Load the charts library with a callback
        GoogleCharts.load(drawChart);

        // function drawChart() {
        //   var data = new google.visualization.DataTable();
        //   data.addColumn('number', 'Day');
        //   data.addColumn('number', 'Guardians of the Galaxy');
        //   data.addColumn('number', 'The Avengers');
        //   data.addColumn('number', 'Transformers: Age of Extinction');

        //   data.addRows([
        //     [1, 37.8, 80.8, 41.8],
        //     [2, 30.9, 69.5, 32.4],
        //     [3, 25.4, 57, 25.7],
        //     [4, 11.7, 18.8, 10.5],
        //     [5, 11.9, 17.6, 10.4],
        //     [6, 8.8, 13.6, 7.7],
        //     [7, 7.6, 12.3, 9.6],
        //     [8, 12.3, 29.2, 10.6],
        //     [9, 16.9, 42.9, 14.8],
        //     [10, 12.8, 30.9, 11.6],
        //     [11, 5.3, 7.9, 4.7],
        //     [12, 6.6, 8.4, 5.2],
        //     [13, 4.8, 6.3, 3.6],
        //     [14, 4.2, 6.2, 3.4],
        //   ]);

        //   var options = {
        //     chart: {
        //       title: 'Box Office Earnings in First Two Weeks of Opening',
        //       subtitle: 'in millions of dollars (USD)',
        //     },
        //     width: 900,
        //     height: 500,
        //   };

        //   var chart = new google.visualization.Line(ldexChartRef.value);

        //   chart.draw(data, google.visualization.Line.convertOptions(options));
        // }
        function drawChart() {
          const data = google.visualization.arrayToDataTable(
            [
              ['Mon', 20, 28, 38, 45],
              ['Tue', 31, 38, 55, 66],
              ['Wed', 50, 55, 77, 80],
              ['Thu', 77, 77, 66, 50],
              ['Fri', 68, 66, 22, 15],
              // Treat first row as data as well.
            ],
            true,
          );

          const options = {
            legend: 'none',
            height: 600,
            backgroundColor: {
              fillOpacity: 0,
            },
            hAxis: {
              textStyle: { color: '#FFF' },
            },
            vAxis: {
              textStyle: { color: '#FFF' },
            },
            chartArea: {
              left: 5,
              top: 20,
              width: '100%',
              height: '350',
            },
          };

          const chart = new google.visualization.CandlestickChart(
            ldexChartRef.value,
          );

          chart.draw(data, options);
        }
        // function drawChart() {
        //   const data = google.visualization.arrayToDataTable(
        //     [['Date', 'Price'], ...chartData],
        //     true,
        //   );

        //   const options = {
        //     chart: {
        //       title: 'Box Office Earnings in First Two Weeks of Opening',
        //       subtitle: 'in millions of dollars (USD)',
        //     },
        //     // width: 900,
        //     // height: 500,
        //   };

        //   const chart = new google.visualization.LineChart(ldexChartRef.value);

        //   chart.draw(data, options);
        // }
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
const tab = computed(() => store.state.activeTab);
const buyToken = computed(() => tab.value.split('/')[0].toUpperCase());
const sellToken = computed(() => tab.value.split('/')[1].toUpperCase());
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
