<template>
  <p v-if="leadSuit">
    Lead:
    <span :class="leadSuit ? leadSuit.toLowerCase() : ''">{{
      suitToIcon(leadSuit)
    }}</span>
    <span v-if="leader">Held by: {{ leader }}</span>
  </p>
</template>

<script>
import utilities from "../js/utilities.js";

export default {
  props: {
    leadSuit: {
      type: String,
      required: false,
    },
    leader: {
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