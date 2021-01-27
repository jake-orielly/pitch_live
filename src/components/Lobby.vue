<template>
  <div id="lobby-container">
    <p>In This Lobby:</p>
    <table class="user-list">
      <tr v-for="user in users" v-bind:key="user.username" class="unselectable">
        <td>{{ user.username }}</td>
        <td
          @click="readyClick(user.username, false)"
          :class="{ clickable: user.username == username }"
          v-if="user.ready"
        >
          <span class="ready-mark">&#10004;</span>
        </td>
        <td
          @click="readyClick(user.username, true)"
          :class="{ clickable: user.username == username }"
          v-if="!user.ready"
        >
          <span class="not-ready-mark">&#10006;</span>
        </td>
      </tr>
    </table>
    <div v-if="gameStarting">
      <p>Game starting in {{ gameStarting }}</p>
      <button @click="readyClick(this.username, false)">Cancel</button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    users: {
      type: Array,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    gameStarting: {
      type: Number,
      required: true
    }
  },
  data() {
    return {};
  },
  methods: {
    readyClick(name, ready) {
      console.log("Ready:", name, ready);
      if (name == this.username) this.$socket.emit("ready", ready);
    },
  },
};
</script>

<style scoped>
</style>