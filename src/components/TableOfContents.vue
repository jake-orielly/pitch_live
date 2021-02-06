<template>
  <div>
    <h1>Tutorial</h1>
    <ul class="clickable">
      <li
        v-for="(section, ind) in sections"
        v-bind:key="section"
        :class="{ 'active-section': currentSection == section }"
        @click="$emit('sectionClick', ind)"
      >
        {{ section }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: {
    sections: {
      type: Array,
      required: true,
    },
    currentSection: {
      type: String,
      required: true,
    },
  },
  data() {
    return {};
  },
  methods: {},
};
</script>

<style lang="scss" scoped>
@import "../scss/common.scss";

* {
  color: white;
  text-shadow: 1px 2px 2px black;
}

ul {
  font-size: 1.5rem;
  list-style: none;
  padding-left: 2rem;
  margin-top: 0.75rem;
}

li {
  margin-bottom: 0.5rem;
}

.active-section {
  font-weight: bold;
}
</style>