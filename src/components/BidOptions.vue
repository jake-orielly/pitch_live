<template>
  <p v-if="bidding" class="bid-div">
    Bid:
    <button
      class="clickable bid-button"
      v-for="i in bidOptions"
      @click="bid(i)"
      v-bind:key="'bid-' + i"
    >
      {{ i }}
    </button>
  </p>
</template>

<script>
export default {
  props: {
    bidding: {
      type: Boolean,
      required: true,
    },
  },
  computed: {
    bidOptions() {
      let baseOptions = ["pass", 2, 3, 4, 5];
      if (this.$store.state.dealer)
        if (this.$store.state.currBid == "pass")
          return "2"
        else
          return ["pass", this.$store.state.currBid]
      else
        return baseOptions.filter(
          (bid) =>
            bid > this.$store.state.currBid ||
            (bid > 0 && this.$store.state.currBid == "pass") ||
            bid == "pass"
        );
    },
  },
  methods: {
    bid(given) {
      this.$socket.emit("bid", given);
      this.$parent.status = "";
      this.$parent.statusText = "";
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../scss/common.scss";

.bid-button {
  margin-left: 0.25em;
}

.bid-div {
  position: absolute;
  top: 27%;
  left: 37%;
  z-index: 10;
  font-size: 1.5rem;
  color: white;
}
</style>