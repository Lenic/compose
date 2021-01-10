<template>
  <div class="about">
    <h1>This is an about page</h1>
    <div>response code: {{ state.code }}</div>
    <button @click="handler">Press</button>
    <button @click="handler2">Seqence</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";

import { compose } from "../http/core";
import seqence from "../http/seqence";

export default defineComponent({
  name: "About",
  setup() {
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

    const seq = seqence<string, string>();
    const handler2 = () => {
      debugger;
      const config = compose<string, string>(
        (v) => {
          return `end(${v})`;
        },
        seq,
        (next) => {
          return new Promise((resolve) => {
            setTimeout(() => {
              const res = next();
              resolve(res);
            }, Math.floor(Math.random() * 1000));
          });
        }
      );

      // config.exec("1").then(console.log);
      // config.exec("2").then(console.log);
      // config.exec("3").then(console.log);
      // config.exec("4").then(console.log);
      // config.exec("5").then(console.log);

      config.exec(Date.now().toString()).then(console.log);
    };

    return {
      state,
      handler,
      handler2
    };
  }
});
</script>
