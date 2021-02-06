<template>
  <div>
    <TutorialPageIntroduction v-if="currentSection == 'Introduction'" />
    <TutorialPagePoints v-if="currentSection == 'Points'" />
    <TutorialPageTricks v-if="currentSection == 'Tricks'" />
  </div>
</template>

<script>
import TutorialPageIntroduction from "./TutorialPageIntroduction.vue";
import TutorialPagePoints from "./TutorialPagePoints.vue";
import TutorialPageTricks from "./TutorialPageTricks.vue";

export default {
  props: {
    currentSection: {
      type: String,
      required: true,
    },
  },
  components: {
    TutorialPageIntroduction,
    TutorialPagePoints,
    TutorialPageTricks
  },
};
</script>

<style scoped>
div {
  margin-top: 2rem;
}
</style>
