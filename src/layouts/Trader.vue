<template>
  <q-layout view="hHh lpR fFf">
    <q-header class="bg-transparent ldex-border-bottom">
      <q-linear-progress
        dark
        query
        color="primary"
        track-color="primary"
        class="absolute"
        v-if="store.state.loading"
      />
      <q-toolbar>
        <q-toolbar-title>LDEX</q-toolbar-title>

        <q-btn icon="mdi-account" flat round @click="$router.push('/')" />
      </q-toolbar>
      <q-tabs
        align="left"
        class="bg-transparent"
        :model-value="tab"
        @update:model-value="changeTab"
      >
        <div class="q-px-md text-grey-7">Markets:</div>
        <template v-for="tab in tabOptions" :key="tab">
          <q-tab :name="tab" class="text-primary" :label="tab" />
        </template>
      </q-tabs>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { changeBaseURL } from 'src/boot/axios';
import { useStore } from 'src/store';
import { computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const store = useStore();
const route = useRoute();
const router = useRouter();

const tabOptions = computed(() => store.marketNames.value);

const tab = computed(() => route.query.market);

onMounted(() => {
  if (!tab.value) changeTab(store.marketNames.value[0]);
});

watch(
  () => tab.value,
  (n) => !n && changeTab(store.marketNames.value[0]),
);

const changeTab = (v) => {
  changeBaseURL(store.state.config.markets[v].apiURL);
  router.push({ path: route.path, query: { ...route.query, market: v } });
};
</script>
