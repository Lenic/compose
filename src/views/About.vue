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
import { defineComponent, reactive } from "vue";

import { compose } from "../http/core";
import seqence from "../http/seqence";

const delay = (wait: number) => <T>(source: Promise<T>): Promise<T> => {
  return new Promise<T>((resolve) => {
    setTimeout(() => {
      resolve(source);
    }, wait);
  });
};

export default defineComponent({
  name: "About",
  setup() {
    const list = reactive<string[]>([]);
    const state = reactive({ code: 0 });

    const handler = () => {
      const config = compose<number, number>(
        (options) => options,
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
      );

      state.code = config.exec(state.code);
    };

    const seq = seqence<string, string>(2);
    const handler2 = () => {
      debugger;
      const config = compose<Promise<string>, string>(
        (v) => {
          return Promise.resolve(`end(${v})`);
        },
        seq,
        (next) => delay(Math.floor(Math.random() * 1000))(next())
      );

      config.exec("1").then((v) => list.push(v));
      config.exec("2").then((v) => list.push(v));
      config.exec("3").then((v) => list.push(v));
      config.exec("4").then((v) => list.push(v));
      config.exec("5").then((v) => list.push(v));

      // config.exec(Date.now().toString()).then(v=>list.push(v);
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
