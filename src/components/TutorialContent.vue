<template>
  <div>
    <TutorialPageIntroduction v-if="currentSection == 'Introduction'" />
    <TutorialPageLobbies v-if="currentSection == 'Lobbies'" />
    <TutorialPageTricks v-if="currentSection == 'Tricks'" />
    <TutorialPagePoints v-if="currentSection == 'Points'" />
    <TutorialPageBidding v-if="currentSection == 'Bidding'" />
    <TutorialPageConclusion v-if="currentSection == 'Thank You'" />
  </div>
</template>

<script>
import TutorialPageIntroduction from "./TutorialPageIntroduction.vue";
import TutorialPageLobbies from "./TutorialPageLobbies.vue";
import TutorialPagePoints from "./TutorialPagePoints.vue";
import TutorialPageTricks from "./TutorialPageTricks.vue";
import TutorialPageBidding from "./TutorialPageBidding.vue";
import TutorialPageConclusion from "./TutorialPageConclusion.vue";

export default {
  props: {
    currentSection: {
      type: String,
      required: true,
    },
  },
  components: {
    TutorialPageIntroduction,
    TutorialPageLobbies,
    TutorialPagePoints,
    TutorialPageTricks,
    TutorialPageBidding,
    TutorialPageConclusion
  },
};
</script>

<style scoped>
div {
  margin-top: 2rem;
}
</style>
