<template>
  <p v-if="bidding" class="bid-div">
    Bid:
    <button
      class="clickable bid-button"
      v-for="i in ['pass', 2, 3, 4, 5].filter(
        (bid) =>
          bid > $parent.currBid ||
          (bid > 0 && $parent.currBid == 'pass') ||
          (bid == 'pass' && (!$parent.dealer || $parent.currBid != 'pass')) ||
          ($parent.dealer && bid == $parent.currBid && $parent.currBid != 'pass')
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
      type: String,
      required: true
    }
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
.bid-button {
  margin-left: 0.25em;
}
</style>