<template>
  <div id="deck-container">
    <ul>
      <li class="card-list" v-for="num in numCards" v-bind:key="'deck-card-' + num">
        <img class="deck-card" v-bind:src="getCardImage('back')"/>
      </li>
    </ul>
  </div>
</template>

<script>
import { EventBus } from '../event-bus.js';
import utilities from "../js/utilities.js";

export default {
  data() {
    return {
      numCards: 0
    };
  },
  methods: {
    getCardImage(val) {
      return utilities.getCardImage(val);
    }
  },
  mounted() {
    this.numCards = this.$store.state.deckCards;
    EventBus.$on('card-dealt', () => {
      this.numCards--;
    });
  }
};
</script>

<style scoped>
@import "../scss/common.scss";
</style>