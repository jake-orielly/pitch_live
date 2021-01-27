<template>
  <div>
    <p class="score-text">Score: {{ score[0] }} | {{ score[1] }}</p>
  </div>
</template>

<script>
export default {
  props: {
    score: {
      type: Array,
      required: true,
    }
  },
};
</script>

<style scoped>
.score-text {
  position: absolute;
  top: 0;
  right: 5em;
}
</style>