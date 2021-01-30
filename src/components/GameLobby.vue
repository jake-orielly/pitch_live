<template>
  <div id="lobby-container">
    <p>In This Lobby:</p>
    <table class="user-list">
      <tr v-for="user in users" v-bind:key="user.id">
        <td>{{ user.username }}</td>
        <td
          @click="readyClick(user.id, false)"
          :class="{ clickable: user.id == id }"
          v-if="user.ready"
        >
          <span class="ready-mark">&#10004;</span>
        </td>
        <td
          @click="readyClick(user.id, true)"
          :class="{ clickable: user.id == id }"
          v-if="!user.ready"
        >
          <span class="not-ready-mark">&#10006;</span>
        </td>
      </tr>
    </table>
    <div v-if="gameStarting">
      <p>Game starting in {{ gameStarting }}</p>
      <button @click="readyClick(this.id, false)">Cancel</button>
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
    id: {
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
    readyClick(id, ready) {
      if (id == this.id) this.$socket.emit("ready", ready);
    },
  },
};
</script>

<style scoped>
#lobby-container {
  color: white;
}

p {
  font-size: 1.5rem;
}

.ready-mark {
  color: #68ff68;
}

.not-ready-mark {
  color: #dc0202;
}

.ready-mark,
.not-ready-mark {
  text-shadow: 2px 3px 7px black;
}

.user-list {
  font-size: 3rem;
}

.user-list td {
  padding-right: 1em;
}

</style>