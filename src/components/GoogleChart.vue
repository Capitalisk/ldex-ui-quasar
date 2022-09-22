<template>
  <div ref="ldexChartRef" style="width: 100%"></div>
</template>

<script setup>
import { ref, computed, watchEffect, onMounted, onUnmounted } from 'vue';

import { useStore } from 'src/store';
import { useRoute } from 'vue-router';

const props = defineProps({
  chartData: { type: Object, required: true },
});

const store = useStore();
const route = useRoute();

const baseToken = computed(() => route.query.market?.split('/')[1]);
const marketConfig = computed(() => store.state.config.assets[baseToken.value]);

const ldexChartRef = ref();

const unitValue = Number(marketConfig.value.unitValue);
const timeMultiplier = Number(marketConfig.value.timeMultiplier) || 1;
const timeOffset = Number(marketConfig.value.timeOffset) || 0;

const calculateChart = () => {
  try {
    const volumeDisplayHeightRatio = 100000;

    const maxVolume = props.chartData.reduce(
      (accumulator, entry) =>
        Number(entry.volume) > accumulator ? Number(entry.volume) : accumulator,
      -Infinity,
    );
    const maxPrice = props.chartData.reduce(
      (accumulator, entry) =>
        Number(entry.price) > accumulator ? Number(entry.price) : accumulator,
      -Infinity,
    );

    const chartData = props.chartData.map((entry) => [
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
  } catch (e) {}
};

watchEffect(() => props.chartData && calculateChart());

onMounted(() => {
  window.addEventListener('resize', calculateChart);
});
onUnmounted(() => {
  window.removeEventListener('resize', calculateChart);
});
</script>

<style lang="scss" scoped></style>
