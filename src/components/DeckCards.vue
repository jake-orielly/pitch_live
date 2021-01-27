<template>
  <div id="deck-container">
    <ul>
      <li class="card-list" v-for="num in 20" v-bind:key="'deck-card-' + num">
        <img class="deck-card" v-bind:src="getCardImage('back')" />
      </li>
    </ul>
  </div>
</template>

<script>
import utilities from "../js/utilities.js";

export default {
  data() {
    return {};
  },
  methods: {
    getCardImage(val) {
      return utilities.getCardImage(val);
    }
  }
};
</script>

<style scoped>
</style>