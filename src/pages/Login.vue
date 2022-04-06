<template>
  <div class="flex items-center ldex-login">
    <div class="row q-pa-xl q-col-gutter-x-lg">
      <div class="col-12">
        <q-select
          :options="markets"
          :model-value="markets[0]"
          outlined
          class="q-mb-lg"
        />
      </div>
      <div
        v-for="(input, i) in inputs"
        :key="i"
        class="col-xs-12 col-sm-6 col-lg-3"
      >
        <q-input
          v-model="input.value"
          :type="isPwd ? 'password' : 'text'"
          :id="`passphrase-${i}`"
          outlined
          dense
          placeholder="__________"
          @keydown="(e) => backspace(e, i)"
          @keyup.enter="signin"
          @focus="() => !pasting && (input = '')"
          :rules="[(val) => !!val || (val && val.length <= 0) || 'Required']"
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
              :name="isPwd ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="isPwd = !isPwd"
            />
          </template>
        </q-input>
      </div>
      <div class="col-12 flex justify-center q-gutter-sm">
        <q-btn label="Login" color="primary" />
        <CreateWallet />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

import { useStore } from 'src/store';

import CreateWallet from 'src/components/CreateWallet.vue';

const store = useStore();

const markets = computed(() => store.marketNames.value);

const inputs = ref(new Array(12));
const hidden = ref(false);
const isPwd = ref(true);

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

<style lang="scss" scoped>
.ldex-login {
  min-height: 100vh;
}
</style>
