<template>
  <div 
    v-if="othersCards"
    id="played-pile"
  >
    <img
      v-for="i in 3"
      v-bind:key="'played-card-' + i"
      class="deck-card played"
      :id="'played-pos-' + (i - 1)"
      v-bind:src="getCardImage(othersCards[i - 1])"
    />
    <img
      class="deck-card played"
      id="played-pos-3"
      v-bind:src="getCardImage(myCard)"
    />
  </div>
</template>

<script>
import utilities from "../js/utilities.js";

export default {
  props: {
    othersCards: {
      type: Array,
      required: false,
    },
    myCard: {
      required: true,
    },
  },
  methods: {
    getCardImage(val) {
      return utilities.getCardImage(val);
    },
  },
};
</script>

<style scoped>
#played-pile {
  position: absolute;
  left: calc(50% - 6.5em);
  top: calc(50% - 8em);
}

.played {
  position: absolute;
}

#played-pos-0 {
  left: -3.5em;
}

#played-pos-1 {
  top: -3.5em;
}

#played-pos-2 {
  left: 3.5em;
}

#played-pos-3 {
  top: 3.5em;
}
</style>