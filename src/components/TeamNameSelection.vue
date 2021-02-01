<template>
  <div>
    <span v-if="$store.state.teamWordOptions.partOfSpeech == 'nouns'">
      {{$store.state.teammatesWord}}
    </span>
    <select
      @change="onChange($event)" 
      name="options" 
      id="options"
    >
      <option v-for="option in $store.state.teamWordOptions.options" v-bind:key="option" :value="option">
        {{ option }}
      </option>
    </select>
    <span v-if="$store.state.teamWordOptions.partOfSpeech == 'adjectives'">
      {{$store.state.teammatesWord}}
    </span>
  </div>
</template>

<script>
export default {
  methods: {
      onChange(event) {
        const teamNum = this.$store.state.users[this.$store.state.users.length - 1].team;
        this.$socket.emit("selectTeamWord", {
          val:event.target.value,
          partOfSpeech: this.$store.state.teamWordOptions.partOfSpeech,
          teamNum
        });
      }
  }
};
</script>

<style scoped>
</style>