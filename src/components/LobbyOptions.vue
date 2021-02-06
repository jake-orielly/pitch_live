<template>
  <div id="lobby-options-container">
    <div>
      <button class="lobby-button animated-button" @click="createLobby">
        Create New Lobby
      </button>
    </div>
    <div>
      <button class="lobby-button animated-button" @click="toggleExistingLobby">
        Join Existing Lobby
      </button>
      <div v-if="existingLobby" id="lobby-code-div">
        <input v-model="lobbyCode" @keyup.enter="joinLobby" />
        <button @click="joinLobby" class="animated-button">Join</button>
        <p v-if="badLobby">
          {{ `Lobby code ${badLobbyCode} is not valid` }}
        </p>
      </div>
    </div>
    <div>
      <button
        @click="startTutorial"
        class="lobby-button animated-button"
        id="tutorial-button"
      >
        Tutorial
      </button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      existingLobby: false,
      lobbyCode: "",
      badLobby: false,
      badLobbyCode: "",
    };
  },
  sockets: {
    joinFailed: function () {
      this.badLobbyCode = this.lobbyCode.toUpperCase();
      this.badLobby = true;
    },
  },
  methods: {
    toggleExistingLobby() {
      this.existingLobby = !this.existingLobby;
    },
    createLobby() {
      this.$socket.emit("createLobby");
    },
    joinLobby() {
      this.$socket.emit("joinLobby", this.lobbyCode.toUpperCase());
    },
    startTutorial() {
      this.$emit("startTutorial");
    },
  },
};
</script>

<style scoped>
@import "../scss/button.scss";

*:focus {
  outline: none;
}

#lobby-options-container {
  text-align: center;
  margin-top: 10%;
}

.lobby-button {
  padding: 0.5rem;
  margin: 1rem;
}

#lobby-code-div {
  margin: 0rem 2rem;
}

input {
  font-size: 1.5rem;
  background: none;
  border: none;
  border-bottom: 2px solid white;
  color: white;
  width: 40%;
  margin-right: 1rem;
}

p {
  color: white;
  position: absolute;
}
</style>