<template>
  <div id="tutorial-content-container">
    <div id="tutorial-body-container">
      <TableOfContents
        :sections="sections"
        :currentSection="currentSection"
        @sectionClick="setSelection"
      />
      <TutorialContent :currentSection="currentSection" />
    </div>
    <div id="tutorial-control-container">
      <button
        v-if="currentSectionNum > 0"
        @click="changeSection(-1)"
        class="animated-button"
      >
        Back
      </button>
      <button
        v-if="currentSectionNum < sections.length - 1"
        @click="changeSection(1)"
        class="animated-button"
      >
        Next
      </button>
      <button
        v-if="currentSectionNum == sections.length - 1"
        @click="closeTutorial"
        class="animated-button"
      >
        Done
      </button>
    </div>
  </div>
</template>

<script>
import TableOfContents from "./TableOfContents.vue";
import TutorialContent from "./TutorialContent.vue";

export default {
  components: {
    TableOfContents,
    TutorialContent,
  },
  data() {
    return {
      sections: ["Introduction", "Lobbies", "Tricks", "Points", "Bidding","Thank You"],
      currentSectionNum: 0,
    };
  },
  computed: {
    currentSection() {
      return this.sections[this.currentSectionNum];
    },
  },
  methods: {
    changeSection(val) {
      this.currentSectionNum += val;
    },
    setSelection(val) {
      this.currentSectionNum = val;
    },
    closeTutorial() {
      this.$emit("closeTutorial");
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../scss/button.scss";

#tutorial-body-container {
  display: grid;
  grid-template-columns: 20% 50%;
  margin-top: 5%;
}

#tutorial-control-container {
  text-align: right;
  margin-right: 15%;
}

button {
  margin-left: 1rem;
}
</style>