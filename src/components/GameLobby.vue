<template>
  <div id="lobby-container">
    <p id="lobby-id">Lobby Id: {{ $store.state.lobbyId }}</p>
    <div id="teams-container">
      <table class="user-list">
        <tr>
          <th v-if="myTeam == 0">
            <TeamNameSelection />
          </th>
          <th v-if="myTeam == 1">{{ otherTeamName }}</th>
        </tr>
        <tr v-for="user in team0" v-bind:key="user.id">
          <td>{{ user.username }}</td>
          <td
            @click="readyClick(user.id, false)"
            :class="{ clickable: user.id == $store.state.id }"
            v-if="user.ready"
          >
            <span class="ready-mark">&#10004;</span>
          </td>
          <td
            @click="readyClick(user.id, true)"
            :class="{ clickable: user.id == $store.state.id }"
            v-if="!user.ready"
          >
            <span class="not-ready-mark">&#10006;</span>
          </td>
        </tr>
      </table>
      <table class="user-list">
        <tr>
          <th v-if="myTeam == 1">
            <TeamNameSelection />
          </th>
          <th v-if="myTeam == 0">{{ otherTeamName }}</th>
        </tr>
        <tr v-for="user in team1" v-bind:key="user.id">
          <td>{{ user.username }}</td>
          <td
            @click="readyClick(user.id, false)"
            :class="{ clickable: user.id == $store.state.id }"
            v-if="user.ready"
          >
            <span class="ready-mark">&#10004;</span>
          </td>
          <td
            @click="readyClick(user.id, true)"
            :class="{ clickable: user.id == $store.state.id }"
            v-if="!user.ready"
          >
            <span class="not-ready-mark">&#10006;</span>
          </td>
        </tr>
      </table>
    </div>
    <div v-if="gameStarting" id="game-starting-container">
      <p>Game starting in {{ gameStarting }}</p>
      <button
        @click="readyClick($store.state.id, false)"
        class="animated-button"
      >
        Cancel
      </button>
    </div>
  </div>
</template>

<script>
import TeamNameSelection from "./TeamNameSelection.vue";

export default {
  components: {
    TeamNameSelection,
  },
  props: {
    username: {
      type: String,
      required: true,
    },
    gameStarting: {
      type: Number,
      required: true,
    },
  },
  computed: {
    myTeam() {
      if (this.$store.state.users.length) {
        console.log(this.$store.state.users);
        console.log(this.$store.state.id);
        return this.$store.state.users.filter(
          (user) => user.id == this.$store.state.id
        )[0].team;
      } else return undefined;
    },
    team0() {
      if (this.$store.state.users.length)
        return this.$store.state.users.filter((user) => user.team == 0);
      else return undefined;
    },
    team1() {
      if (this.$store.state.users.length)
        return this.$store.state.users.filter((user) => user.team == 1);
      else return undefined;
    },
    otherTeamName() {
      return this.$store.state.teamNames[(this.myTeam + 1) % 2].join(" ");
    },
  },
  data() {
    return {};
  },
  methods: {
    readyClick(id, ready) {
      if (id == this.$store.state.id) this.$socket.emit("ready", ready);
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../scss/common.scss";
@import "../scss/button.scss";

#lobby-container {
  padding: 5rem 0em;
  color: white;
}

#teams-container {
  text-align: center;
}

table {
  display: inline-block;
  margin-right: 4rem;
  height: 15rem;
}

p {
  font-size: 1.5rem;
}

th {
  font-weight: bold;
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

#lobby-id {
  position: absolute;
  top: 1rem;
  user-select: text;
}

#game-starting-container {
  text-align: center;
  font-size: 1.5rem;
}
</style>