<template>
  <p v-if="bidding" class="bid-div">
    Bid:
    <button
      class="clickable bid-button"
      v-for="i in ['pass', 2, 3, 4, 5].filter(
        (bid) =>
          bid > $store.state.currBid ||
          (bid > 0 && $store.state.currBid == 'pass') ||
          (bid == 'pass' &&
            (!$store.state.dealer || $store.state.currBid != 'pass')) ||
          ($store.state.dealer &&
            bid == $store.state.currBid &&
            $store.state.currBid != 'pass')
      )"
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
  methods: {
    bid(given) {
      this.$socket.emit("bid", given);
      this.$parent.status = "";
      this.$parent.statusText = "";
    },
  },
};
</script>

<style scoped>
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