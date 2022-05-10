<template>
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
      <q-tooltip>The total amount of {{ originToken }} being sold</q-tooltip>
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
    <div class="col" style="border-color: rgb(40, 97, 19); border-top: 2px">
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
      <q-tooltip> The total amount of {{ baseToken }} being bought </q-tooltip>
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
</template>

<script setup>
import { getOrderBook } from 'src/boot/axios';
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';

const props = defineProps({ currentPrice: { type: Number, required: true } });

const route = useRoute();

const buyingOffers = ref([]);
const sellingOffers = ref([]);
const maxSize = reactive({
  bid: 0,
  ask: 0,
});

const originToken = computed(() =>
  route.query.market.split('/')[0].toUpperCase(),
);
const baseToken = computed(() =>
  route.query.market.split('/')[1].toUpperCase(),
);

// TODO: Get unitValue from config
const numberToDecimal = (v) => (v / 100000000).toLocaleString('en-US');

onMounted(async () => {
  sellingOffers.value = [];
  buyingOffers.value = [];

  try {
    const data = await getOrderBook(20);
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
  } catch (err) {
    console.error(err);
    $q.notify({ message: err.message, color: 'red' });
  }
});
</script>

<style lang="scss" scoped></style>
