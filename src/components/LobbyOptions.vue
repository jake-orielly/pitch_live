<template>
  <div id="lobby-options-container">
    <div></div>
    <div>
      <button class="lobby-button" @click="createLobby">Create New Lobby</button>
    </div>
    <div>
      <button class="lobby-button" @click="toggleExistingLobby">Join Existing Lobby</button>
      <div v-if="existingLobby" id="lobby-code-div">
        <input v-model="lobbyCode" />
        <button @click="joinLobby">Join</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      existingLobby: false,
      lobbyCode: ""
    };
  },
  methods: {
    toggleExistingLobby() {
      this.existingLobby = !this.existingLobby;
    },
    createLobby() {
      this.$emit("joinedLobby");
    },
    joinLobby() {
      this.$emit("joinedLobby");
    }
  },
};
</script>

<style scoped>
*:focus {
    outline: none;
}

#lobby-options-container {
  display: grid;
  grid-template-columns: 25% 25% 25%;
  padding-top: 15%;
}

button {
  background: none;
  border: 3px solid white;
  color: white;
  box-shadow: 1px 1px 9px #0000009c;
  border-radius: 0.5rem;
  font-size: 1.5rem;
}
.lobby-button {
  padding: 0.5rem;
  margin: 2rem;
}

#lobby-code-div {
  margin: 0rem 2rem;
  text-align: center;
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
</style>