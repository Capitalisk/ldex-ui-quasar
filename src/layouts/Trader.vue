<template>
  <q-layout view="hHh lpR fFf">
    <q-header class="bg-transparent">
      <q-linear-progress dark query color="primary" track-color="primary" class="absolute" v-if="store.state.loading" />
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
import { useStore } from 'src/store';
import { ref, computed } from 'vue';

const store = useStore();

const tabOptions = computed(() => store.marketNames.value);

const tab = computed(() => store.state.activeTab);

const changeTab = store.changeTab;
</script>
