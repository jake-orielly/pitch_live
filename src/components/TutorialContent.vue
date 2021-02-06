<template>
    <div>
        <TutorialPageIntroduction v-if="currentSection == 'Introduction'"/>
    </div>
</template>

<script>
import TutorialPageIntroduction from "./TutorialPageIntroduction.vue"

export default {
    props: {
        currentSection: {
            type: String,
            required: true
        }
    },
    components: {
        TutorialPageIntroduction,
    }
};
</script>

<style scoped>
div {
    margin-top: 2rem;
}
</style>
