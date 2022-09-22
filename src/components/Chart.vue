<template>
  <div ref="lineChartRef" id="line-chart-container"></div>
  <!-- <div ref="volumeChartRef" id="volume-chart-container"></div> -->
</template>

<script setup>
import { ref, computed, watchEffect, onMounted, onUnmounted, nextTick } from 'vue';
import { useStore } from 'src/store';
import { useRoute } from 'vue-router';
import { createChart } from 'lightweight-charts';

const props = defineProps({
  chartData: { type: Object, required: true },
});

const store = useStore();
const route = useRoute();

const baseToken = computed(() => route.query.market?.split('/')[1]);
const marketConfig = computed(() => store.state.config.assets[baseToken.value]);

const chart = ref(null);

const lineChartRef = ref();
const volumeChartRef = ref();

const unitValue = Number(marketConfig.value.unitValue);
const timeMultiplier = Number(marketConfig.value.timeMultiplier) || 1;
const timeOffset = Number(marketConfig.value.timeOffset) || 0;

const calculateChart = () => {
  clearChart();
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

    const chartData = props.chartData.map((entry) => ({
      time:
        new Date(
          Math.round(entry.baseTimestamp * timeMultiplier + timeOffset),
        ).getTime() / 1000,
      value: entry.price,
      // volume:
      //   (Math.round((Number(entry.volume) * 100) / maxVolume) *
      //     maxPrice *
      //     volumeDisplayHeightRatio) /
      //   unitValue,
    }));

    chart.value = createChart(lineChartRef.value, {
      grid: {
        horzLines: {
          color: 'rgba(0, 0, 0, 0.25)',
          // visible: false
        },
        vertLines: {
          color: 'rgba(0, 0, 0, 0.25)',
          // visible: false
        },
      },
      layout: {
        textColor: 'white',
        background: { type: 'solid', color: 'transparent' },
        // fontFamily: 'Roboto',
        // fontSize: '12px',
      },
    });

    const areaSeries = chart.value.addAreaSeries({
      priceLineColor: 'green',
      lineColor: '#2962FF',
      topColor: '#2962FF',
      // bottomColor: 'rgba(41, 98, 255, 0.28)',
    });
    // areaSeries.setData([
    //   { time: '2018-12-22', value: 32.51 },
    //   { time: '2018-12-23', value: 31.11 },
    //   { time: '2018-12-24', value: 27.02 },
    //   { time: '2018-12-25', value: 27.32 },
    //   { time: '2018-12-26', value: 25.17 },
    //   { time: '2018-12-27', value: 28.89 },
    //   { time: '2018-12-28', value: 25.46 },
    //   { time: '2018-12-29', value: 23.92 },
    //   { time: '2018-12-30', value: 22.68 },
    //   { time: '2018-12-31', value: 22.67 },
    // ]);

    console.log(chartData);

    areaSeries.setData(chartData);

    // const candlestickSeries = chart.addCandlestickSeries();
    // candlestickSeries.setData([
    //     { time: '2018-12-22', open: 75.16, high: 82.84, low: 36.16, close: 45.72 },
    //     { time: '2018-12-23', open: 45.12, high: 53.90, low: 45.12, close: 48.09 },
    //     { time: '2018-12-24', open: 60.71, high: 60.71, low: 53.39, close: 59.29 },
    //     { time: '2018-12-25', open: 68.26, high: 68.26, low: 59.04, close: 60.50 },
    //     { time: '2018-12-26', open: 67.71, high: 105.85, low: 66.67, close: 91.04 },
    //     { time: '2018-12-27', open: 91.04, high: 121.40, low: 82.70, close: 111.40 },
    //     { time: '2018-12-28', open: 111.51, high: 142.83, low: 103.34, close: 131.25 },
    //     { time: '2018-12-29', open: 131.33, high: 151.17, low: 77.68, close: 96.43 },
    //     { time: '2018-12-30', open: 106.33, high: 110.20, low: 90.39, close: 98.10 },
    //     { time: '2018-12-31', open: 109.87, high: 114.69, low: 85.66, close: 111.26 },
    // ]);

    // const chartOptions =
    // const volumeChart = createChart(
    //   document.getElementById('volume-chart-container'),
    //   {
    //     layout: {
    //       textColor: 'black',
    //       background: { type: 'solid', color: 'white' },
    //     },
    //   },
    // );
    // const histogramSeries = chart.addHistogramSeries({ color: '#26a69a' });

    // const data = [
    //   { value: 1, time: 1642425322 },
    //   { value: 8, time: 1642511722 },
    //   { value: 10, time: 1642598122 },
    //   { value: 20, time: 1642684522 },
    //   { value: 3, time: 1642770922, color: 'red' },
    //   { value: 43, time: 1642857322 },
    //   { value: 41, time: 1642943722, color: 'red' },
    //   { value: 43, time: 1643030122 },
    //   { value: 56, time: 1643116522 },
    //   { value: 46, time: 1643202922, color: 'red' },
    // ];

    // histogramSeries.setData(data);

    nextTick(() => chart.value.timeScale().fitContent());
  } catch (e) {}
};

const clearChart = () => {
  if (chart.value) {
    chart.value.remove();
    chart.value = null;
  }
};

watchEffect(() => props.chartData && calculateChart());

onMounted(calculateChart);

onUnmounted(clearChart);
</script>

<style lang="scss" scoped>
#line-chart-container {
  width: 100%;
  height: 50vh;
}
</style>
