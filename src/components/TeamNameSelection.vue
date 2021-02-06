<template>
  <div>
    <span v-if="$store.state.teamWordOptions.partOfSpeech == 'nouns'">
      {{ $store.state.teamNames[myTeam][0] }}
    </span>
    <select @change="onChange($event)" name="options" id="options">
      <option
        v-for="option in $store.state.teamWordOptions.options"
        v-bind:key="option"
        :value="option"
      >
        {{ option }}
      </option>
    </select>
    <span v-if="$store.state.teamWordOptions.partOfSpeech == 'adjectives'">
      {{ $store.state.teamNames[myTeam][1] }}
    </span>
  </div>
</template>

<script>
export default {
  computed: {
    myTeam() {
      if (this.$store.state.users.length) {
        console.log(this.$store.state.users);
        return this.$store.state.users.filter(
          (user) => user.id == this.$store.state.id
        )[0].team;
      } else return undefined;
    },
  },
  methods: {
    onChange(event) {
      const teamNum = this.$store.state.users[
        this.$store.state.users.length - 1
      ].team;
      this.$socket.emit("selectTeamWord", {
        val: event.target.value,
        partOfSpeech: this.$store.state.teamWordOptions.partOfSpeech,
        teamNum,
      });
    },
  },
};
</script>

<style scoped>
select,
option {
  background: none;
  border: none;
  color: white;
  font-weight: bold;
  font-size: 3rem;
}

*:focus {
  outline: none;
}

select {
  border: 2px solid white;
  border-radius: 0.5rem;
  padding: 0.25rem;
}

option {
  background-color: seagreen;
}
</style>