<template>
    <div>
        <TutorialPageIntroduction v-if="currentSection == 'Introduction'"/>
        <TutorialPagePoints v-if="currentSection == 'Points'"/>
    </div>
</template>

<script>
import TutorialPageIntroduction from "./TutorialPageIntroduction.vue";
import TutorialPagePoints from "./TutorialPagePoints.vue";

export default {
    props: {
        currentSection: {
            type: String,
            required: true
        }
    },
    components: {
        TutorialPageIntroduction,
        TutorialPagePoints
    }
};
</script>

<style scoped>
div {
    margin-top: 2rem;
}
</style>
