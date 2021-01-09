<template>
  <div class="about">
    <h1>This is an about page</h1>
    <div>response code: {{ state.code }}</div>
    <button @click="handler">Press</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";

import { compose } from "../http/core";

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
          const res = next(4);
          return res + 2 + options;
        },
        (next, options) => {
          const res = next(5);
          return res + 3 + options;
        },
        (next, options) => {
          const res = next(6);
          return res + 4 + options;
        }
      );

      state.code = config.exec(state.code);
    };

    return {
      state,
      handler
    };
  }
});
</script>
