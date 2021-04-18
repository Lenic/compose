<template>
  <div class="about">
    <h1>This is an about page</h1>
    <div>response code: {{ state.code }}</div>
    <button @click="handler">Press</button>
    <button @click="handler2">Seqence</button>
    <ul>
      <li :key="index" v-for="(item, index) in list">{{ item }}</li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from 'vue';

import { compose } from '../http/core';
import seqence from '../http/seqence';

export default defineComponent({
  name: 'About',
  setup() {
    const list = ref<string[]>([]);
    const state = reactive({ code: 0 });

    const handler = () => {
      const config = compose<number, number>((options) => options, [
        (next, options) => {
          const res = next(3);
          return res + 1 + options;
        },
        (next, options) => {
          const res = next();
          return res + 2 + options;
        },
        (next, options) => {
          const res = next(5);
          return res + 3 + options;
        },
        (next, options) => {
          const res = next();
          return res + 4 + options;
        }
      ]);

      state.code = config.exec(state.code);
    };

    const seq = seqence<string, string>(2);
    const handler2 = () => {
      list.value = [];
      const config = compose<Promise<string>, string>((v) => Promise.resolve(`end(${v})`), [
        seq,
        (next) => {
          return new Promise<string>((r) => {
            setTimeout(() => {
              r(next());
            }, Math.floor(Math.random() * 1000));
          });
        }
      ]);

      config.exec('1').then((v) => list.value.push(v));
      config.exec('2').then((v) => list.value.push(v));
      config.exec('3').then((v) => list.value.push(v));
      config.exec('4').then((v) => list.value.push(v));
      config.exec('5').then((v) => list.value.push(v));
    };

    return {
      list,
      state,
      handler,
      handler2
    };
  }
});
</script>
