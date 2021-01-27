<template>
  <div>
    <p>Score: {{ score[0] }} | {{ score[1] }}</p>
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
</style>