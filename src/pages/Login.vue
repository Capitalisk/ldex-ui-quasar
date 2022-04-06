<template>
  <div v-for="(input, i) in inputs" :key="i">
    <q-input
      :prefix="`${i + 1}`"
      v-model="input.vlaue"
      :type="hidden ? 'password' : 'text'"
      :id="`passphrase-${i}`"
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
    />
  </div>
  <CreateWallet />
</template>

<script setup>
import CreateWallet from 'src/components/CreateWallet.vue';
import { ref } from 'vue';

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
