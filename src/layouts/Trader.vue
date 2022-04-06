<template>
  <q-layout view="hHh lpR fFf">
    <q-header class="bg-dark">
      <q-toolbar>
        <q-toolbar-title>LDEX</q-toolbar-title>

        <q-btn icon="mdi-account" flat round @click="$router.push('/login')" />
      </q-toolbar>
      <q-tabs align="left" class="bg-grey-9" v-model="tab">
        <div class="q-px-md text-grey-8">Markets:</div>
        <template v-for="tab in tabOptions" :key="tab">
          <q-tab :name="tab" class="text-primary" :label="tab" />
        </template>
      </q-tabs>
    </q-header>

    <q-page-container class="bg-dark">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { useQuasar } from 'quasar';
import { useStore } from 'src/store';
import { ref, computed } from 'vue';

const store = useStore();

const $q = useQuasar();
$q.dark.set(true); // or false or "auto"

const tabOptions = computed(() => store.marketNames.value);

const tab = ref(tabOptions.value[0]);
</script>
