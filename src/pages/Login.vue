<template>
  <q-card class="bg-dark">
    <div class="flex items-center">
      <q-btn
        class="absolute-top-right q-ma-sm"
        icon="mdi-close"
        flat
        round
        size="md"
        v-close-popup
      />
      <q-card-section class="q-mx-auto">
        <h5 class="q-my-none">{{ token }}</h5>
      </q-card-section>
      <q-card-section>
        <div class="row q-pa-xl q-col-gutter-x-lg">
          <div class="col-12"></div>
          <div v-for="(input, i) in inputs" :key="i" class="col-xs-12 col-sm-6">
            <q-input
              v-model="input.value"
              :type="hidden ? 'password' : 'text'"
              :id="`passphrase-${i}`"
              outlined
              dense
              placeholder="__________"
              @keydown="(e) => backspace(e, i)"
              @keyup.enter="signin"
              @focus="() => !pasting && (input = '')"
              :rules="[
                (val) => !!val || (val && val.length <= 0) || 'Required',
              ]"
              :ref="
                (el) => {
                  if (el) inputRefs[i] = el;
                }
              "
              hide-validation
              class="q-mb-sm"
            >
              <template v-slot:prepend>
                <span class="text-caption">{{ i + 1 }}</span>
              </template>
              <template v-slot:append>
                <q-icon
                  :name="hidden ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="hidden = !hidden"
                />
              </template>
            </q-input>
          </div>
          <div class="col-12 flex justify-center q-gutter-sm">
            <q-btn rounded label="Login" color="primary" class="q-px-lg" />
            <CreateWallet />
          </div>
        </div>
      </q-card-section>
    </div>
  </q-card>
</template>

<script setup>
import { ref } from 'vue';

import { useStore } from 'src/store';

import CreateWallet from 'src/components/CreateWallet.vue';

defineProps({
  token: String,
});

const store = useStore();

// const markets = computed(() => store.marketNames.value);

const inputs = ref(new Array(12));
const hidden = ref(false);

const inputRefs = ref([]);

for (let i = 0; i < inputs.value.length; i++) {
  inputs.value[i] = { value: '' };
}

const signin = () => {};

const backspace = (e, i) => {
  console.log(e);
  return (
    e.target.value === '' &&
    e.keyCode === 8 &&
    i !== 0 &&
    inputRefs.value[i - 1].focus()
  );
};
</script>

<style lang="scss" scoped></style>
