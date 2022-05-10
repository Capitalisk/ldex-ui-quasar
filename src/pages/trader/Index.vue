<template>
  <q-page :key="route.query.market">
    <div class="row absolute-bottom absolute-top" v-if="currentPrice">
      <div class="col">
        <div class="row full-width">
          <Chart v-if="priceHistory" :chart-data="priceHistory" />
        </div>
      </div>
      <div class="col-3 full-height ldex-border-left ldex-border-right">
        <OrderBook :current-price="currentPrice" />
      </div>
      <div class="col-3">
        <OrderPanel :current-price="currentPrice" />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import { useQuasar } from 'quasar';

import { api } from 'src/boot/axios';

import Chart from '../../components/Chart';
import OrderBook from 'src/components/OrderBook.vue';
import OrderPanel from 'src/components/OrderPanel.vue';

const $q = useQuasar();
const route = useRoute();

const currentPrice = ref(null);

const priceHistory = ref([]);

watchEffect(async () => {
  if (route.query.market) {
    try {
      const { data } = await api.get('/prices/recent');
      currentPrice.value = data[0]?.price;
      priceHistory.value = data;
    } catch (err) {
      console.error(err);
      $q.notify({ message: err.message, color: 'red' });
    }
  }
});
</script>

<style lang="scss" scoped>
@import '../../css/quasar.variables.scss';

.btn-fixed-width {
  width: 200px;
}
</style>
