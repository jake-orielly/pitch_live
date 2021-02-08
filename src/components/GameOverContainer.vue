<template>
  <div v-if="gameOver" id="game-over-container">
    <h1>The {{ winningTeam.join(" ") }} win!</h1>
    <button
      class="animated-button"
      @click="backToLobby"
    >
      Return to Lobby
    </button>
  </div>
</template>

<script>
import { EventBus } from "../event-bus.js";

export default {
  data() {
    return {
      gameOver: false,
      winningTeam: "",
    };
  },
  mounted() {
    EventBus.$on("game-over", () => {
      this.gameOver = true;
      this.winningTeam = this.$store.state.winningTeam;
    });
  },
  methods: {
    backToLobby() {
      this.gameOver = false;
      this.winningTeam = undefined;
      this.$emit("backToLobby");
    }
  }
};
</script>

<style scoped>
#game-over-container {
  margin-top: -4rem;
  text-align: center;
}
h1 {
  text-align: center;
  color: white;
  text-shadow: 1px 1px 1px black;
  letter-spacing: 1px;
}
</style>