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
              @focus="() => !pasting && (input.value = '')"
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
            <q-btn
              rounded
              label="Login"
              color="primary"
              class="q-px-lg"
              @click="signin"
            />
            <CreateWallet />
          </div>
        </div>
      </q-card-section>
    </div>
  </q-card>
</template>

<script setup>
import { onBeforeMount, ref, watch, nextTick } from 'vue';

import CreateWallet from 'src/components/CreateWallet.vue';
import { useStore } from 'src/store';
import { useQuasar } from 'quasar';

const props = defineProps({
  token: String,
});

const emit = defineEmits(['loggedIn']);

const store = useStore();
const $q = useQuasar();

// const markets = computed(() => store.marketNames.value);

const inputs = ref(new Array(12));
const hidden = ref(false);
const passphrase = ref(null);
const pasting = ref(false);

const inputRefs = ref([]);

onBeforeMount(() => {
  for (let i = 0; i < inputs.value.length; i++) {
    inputs.value[i] = { value: '' };
  }
});

const validateAllInputs = async () => {
  // await new Promise((res) => setTimeout(() => res(), 100));
  return await new Promise(async (res, rej) => {
    let errors = [];
    for (let i = 0; i < inputRefs.value.length; i++) {
      const v = inputRefs.value[i];
      await v.validate();
      if (v.error) errors.push(v.error);
    }
    if (errors.length) rej(new Error('One or more fields are invalid.'));
    res();
  });
};

const backspace = (e, i) => {
  console.log(e);
  return (
    e.target.value === '' &&
    e.keyCode === 8 &&
    i !== 0 &&
    inputRefs.value[i - 1].focus()
  );
};

watch(
  () => inputs.value,
  async (n) => {
    for (let i = 0; i < n.length; i++) {
      if (!n[i]) continue;

      const element = n[i].value;
      const lastInput = inputRefs.value[n.length - 1];

      if (element && element.split(' ').length === 12) {
        pasting.value = true;
        inputs.value = element.split(' ').map((el) => ({ value: el }));
        try {
          await validateAllInputs();
        } catch (e) {}
        lastInput.focus();
        pasting.value = false;
      } else if (element && element.includes(' ')) {
        const nextInput = inputRefs.value[i + 1];
        if (nextInput) {
          nextInput.focus();
          nextTick(() => (nextInput.value = ''));
        }
        inputs.value[i].value = inputs.value[i].value.replace(/\s/g, '');
      }
    }
    passphrase.value = n
      .filter((el) => el.value !== '')
      .map((el) => el.value)
      .join(' ');
  },
  {
    deep: true,
    immediate: false,
  },
);

const signin = async () => {
  try {
    await validateAllInputs();

    console.log(store.assetAdapters, props.token);

    const assetAdapter = store.assetAdapters[props.token.toLocaleLowerCase()];
    console.log(assetAdapter);

    const isValid = assetAdapter.validatePassphrase({
      passphrase: passphrase.value,
    });
    if (!isValid) throw new Error('Incorrect passphrase');

    await assetAdapter.connect({ passphrase: passphrase.value });

    const address =
      assetAdapter.address ||
      (await assetAdapter.getAddressFromPassphrase(passphrase.value));

    store.setAssetDetails({
      token: props.token,
      address,
      passphrase: passphrase.value,
    });

    emit('loggedIn');
  } catch (e) {
    console.error(e);
    $q.notify({ message: e.message, color: 'negative' });
  }
};
</script>

<style lang="scss" scoped></style>
