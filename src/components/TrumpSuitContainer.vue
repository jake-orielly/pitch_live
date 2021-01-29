<template>
  <p v-if="$store.state.trumpSuit">
    Trump:
    <span :class="$store.state.trumpSuit ? $store.state.trumpSuit.toLowerCase() : ''">{{
      suitToIcon($store.state.trumpSuit)
    }}</span>
  </p>
</template>

<script>
import utilities from "../js/utilities.js";

export default {
  methods: {
    suitToIcon(val) {
      return utilities.suitToIcon(val);
    }
  },
};
</script>

<style scoped>
p {
  color: white;
  font-size: 1.5rem;
}
</style>