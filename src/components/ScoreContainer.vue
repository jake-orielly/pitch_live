<template>
  <div>
    <table>
      <tr>
        <td class="team-label">{{teamLabels[0]}}:</td>
        <td class="team-name">{{ $store.state.teamNames[0] }}:</td>
        <td>{{ score[0] }}</td>
      </tr>
      <tr>
        <td class="team-label">{{teamLabels[1]}}:</td>
        <td class="team-name">{{ $store.state.teamNames[1] }}:</td>
        <td>{{ score[1] }}</td>
      </tr>
    </table>
  </div>
</template>

<script>
export default {
  data() {
    return {
      teamLabels: ["", ""]
    }
  },
  props: {
    score: {
      type: Array,
      required: true,
    },
  },
  mounted() {
    const usTeam = this.$store.state.users[this.$store.state.users.length - 1].team;
    this.$set(this.teamLabels, usTeam, "Us");
    this.$set(this.teamLabels, (usTeam + 1) % 2, "Them");
  }
};
</script>

<style scoped>
table {
  color: white;
  font-size: 1.5rem;
}

.team-name {
  padding-right: 1rem;
}

.team-label {
  padding-right: 1rem;
  text-align: right;
}
</style>