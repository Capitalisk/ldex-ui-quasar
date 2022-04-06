<template>
  <router-view />
</template>
<script setup>
import { provide } from 'vue';
import { useQuasar } from 'quasar';

import store from './store';

provide('store', store);

const $q = useQuasar();
$q.dark.set(true); // or false or "auto"
</script>
