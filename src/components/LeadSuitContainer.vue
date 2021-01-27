<template>
  <p v-if="$store.state.leadSuit">
    Lead:
    <span v-if="$store.state.leader">{{ `${$store.state.leader}'s ` }}</span>
    <span :class="$store.state.leadSuit ? $store.state.leadSuit.toLowerCase() : ''">{{
      suitToIcon($store.state.leadSuit)
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
</style>