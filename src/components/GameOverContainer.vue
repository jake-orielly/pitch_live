<template>
  <div v-if="gameOver" id="game-over-container">
    <h1>The {{winningTeam}} win!</h1>
  </div>
</template>

<script>
import { EventBus } from '../event-bus.js';

export default {
  data() {
    return {
      gameOver: false,
      winningTeam: ""
    }
  },
  mounted() {
    EventBus.$on('game-over', () => {
      this.gameOver = true;
      this.winningTeam = this.$store.state.winningTeam;
    });
  }
};
</script>

<style scoped>
h1 {
  text-align: center;
  color: white;
  text-shadow: 1px 1px 1px black;
  letter-spacing: 1px;
}
</style>