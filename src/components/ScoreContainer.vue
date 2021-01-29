<template>
  <div>
    <table>
      <tr>
        <td class="team-name">{{ $store.state.teamNames[0] }}:</td>
        <td>{{ score[0] }}</td>
      </tr>
      <tr>
        <td class="team-name">{{ $store.state.teamNames[1] }}:</td>
        <td>{{ score[1] }}</td>
      </tr>
    </table>
  </div>
</template>

<script>
export default {
  props: {
    score: {
      type: Array,
      required: true,
    },
  },
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
</style>