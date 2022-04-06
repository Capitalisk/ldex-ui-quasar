<template>
  <q-layout view="hHh lpR fFf">
    <q-header class="bg-dark">
      <q-toolbar>
        <q-toolbar-title>LDEX</q-toolbar-title>

        <div><q-icon icon="account"></q-icon></div>
      </q-toolbar>
      <q-tabs align="left" class="bg-grey-9" v-model="tab">
        <div class="q-px-md text-grey-8">Markets:</div>
        <q-tab name="LSH" class="text-primary" label="LSK/LSH" />
        <q-tab name="CLSK" class="text-primary" label="LSK/CLSK" />
      </q-tabs>
    </q-header>

    <q-page-container class="bg-dark">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { useQuasar } from 'quasar';
import { ref } from 'vue';

const $q = useQuasar();
$q.dark.set(true); // or false or "auto"

const tab = ref('LSH');
</script>
