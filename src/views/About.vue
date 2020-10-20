<template>
  <div class="about">
    <h1>This is an about page</h1>
    <div>response code: {{ state.code }}</div>
    <button @click="handler">Press</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";

import Compose from "../http/core";

export default defineComponent({
  name: "About",
  setup() {
    const state = reactive({ code: 0 });

    const handler = () => {
      const config = Compose<number, number>([
        (next, options) => options,
        (next, options) => next() + 1 + options,
        (next, options) => next() + 2 + options,
        (next, options) => next() + 3 + options,
        (next, options) => next() + 4 + options
      ]);

      state.code = config.exec(state.code);
    };

    return {
      state,
      handler
    };
  }
});
</script>
