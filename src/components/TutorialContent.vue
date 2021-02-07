<template>
  <div>
    <TutorialPageIntroduction v-if="currentSection == 'Introduction'" />
    <TutorialPageTricks v-if="currentSection == 'Tricks'" />
    <TutorialPagePoints v-if="currentSection == 'Points'" />
    <TutorialPageBidding v-if="currentSection == 'Bidding'" />
  </div>
</template>

<script>
import TutorialPageIntroduction from "./TutorialPageIntroduction.vue";
import TutorialPagePoints from "./TutorialPagePoints.vue";
import TutorialPageTricks from "./TutorialPageTricks.vue";
import TutorialPageBidding from "./TutorialPageBidding.vue";

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
    TutorialPageTricks,
    TutorialPageBidding
  },
};
</script>

<style scoped>
div {
  margin-top: 2rem;
}
</style>
