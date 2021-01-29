<template>
  <div :class="playerClass">
    <p class="nametag">{{ username }}</p>
    <img
        v-for="i in numCards"
        v-bind:key="`${username}-${i}`"
        v-bind:style="{ transform: 'rotate(' + (i - 3.5) * 5 + 'deg)' }"
        class="other-player-card"
        v-bind:src="getCardImage('back')"
      />
  </div>
</template>

<script>
import utilities from "../js/utilities.js"

export default {
  props: {
    username: {
      type: String,
      required: true,
    },
    numCards: {
      type: Number,
      required: true
    },
    playerClass: {
      type: String,
      required: true
    }
  },
  data() {
    return {
    };
  },
  methods: {
    getCardImage(val) {
      return utilities.getCardImage(val);
    }
  },
};
</script>

<style scoped>
.opponent-0 {
  position: absolute;
  left: 4em;
  top: 35%;
  transform: rotate(90deg);
}

.opponent-1 {
  position: absolute;
  right: 4em;
  top: 35%;
  transform: rotate(270deg);
}

.teammate-1 {
  position: absolute;
  left: 42%;
  top: 4em;
}

.other-player-card {
  margin-right: -2.5em;
  margin-left: -2.5em;
}

.nametag {
  background-color: white;
  color: black;
  text-align: center;
  border: 4px solid black;
  border-radius: 9px;
  box-shadow: 1px 1px 9px #0000009c;
  position: absolute;
  z-index: 30;
  padding: 0em 1em;
  font-size: 1.5rem;
}

</style>