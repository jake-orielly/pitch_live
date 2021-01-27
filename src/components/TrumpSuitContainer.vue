<template>
  <p v-if="trumpSuit">
    Trump:
    <span :class="trumpSuit ? trumpSuit.toLowerCase() : ''">{{
      suitToIcon(trumpSuit)
    }}</span>
  </p>
</template>

<script>
import utilities from "../js/utilities.js";

export default {
  props: {
    trumpSuit: {
      type: String,
      required: false,
    },
  },
  methods: {
    suitToIcon(val) {
      return utilities.suitToIcon(val);
    }
  },
};
</script>

<style scoped>
</style>