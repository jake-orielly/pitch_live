<template>
  <div id="hand-container">
    <ul>
      <li
        v-for="(card, ind) in hand"
        v-bind:key="'hand-card-' + ind"
        @click="play(card)"
        class="hand-card-slot card-list"
      >
        <img
          class="card hand-card"
          v-bind:src="getCardImage(card)"
          v-if="showCards"
        />
      </li>
      <li
        v-for="(card, ind) in dealCount"
        v-bind:key="'card-back-' + ind"
        class="hand-card-slot card-list"
      >
        <img
          class="card hand-card"
          v-bind:src="getCardImage('back')"
          v-if="!showCards"
        />
      </li>
      <li 
        v-if="!this.$store.state.trumpSuit && this.$parent.currPlay"
        id="declare-alternate-list-item"
      >
        <div id="alternate-container">
          <p
            class="white-text"
          >
            Declare Alternate
          </p>
          <button
            @click="declareAlternate('Spades')"
            class="animated-button"
          >
            ♠
          </button>
          <button
            @click="declareAlternate('Clubs')"
            class="animated-button"
          >
            ♣
          </button>
          <button
            @click="declareAlternate('Hearts')"
            class="animated-button"
          >
            ♥
          </button>
          <button
            @click="declareAlternate('Diamonds')"
            class="animated-button"
          >
            ♦
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import { EventBus } from "../event-bus.js";
import utilities from "../js/utilities.js";

export default {
  props: {
    hand: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      dealCount: 0,
      dealDone: false,
      showCards: false,
    };
  },
  methods: {
    play(card) {
      if (this.$parent.currPlay && !card.played) {
        let legal = true;
        if (
          this.$store.state.leadSuit &&
          this.$store.state.leadSuit != card.suit &&
          this.$store.state.trumpSuit != card.suit
        )
          for (var i = 0; i < this.hand.length; i++)
            if (this.hand[i].suit == this.$store.state.leadSuit) legal = false;
        if (!legal) alert("Illegal move, you must follow");
        else {
          this.$socket.emit("play", card);
          this.$parent.currPlay = false;
          for (let i = 0; i < this.hand.length; i++)
            if (
              this.hand[i].suit == card.suit &&
              this.hand[i].num == card.num
            ) {
              card.played = true;
              this.$parent.hand.splice(i, 1);
              this.$parent.myCard = card;
              this.$parent.currTrick++;
              break;
            }
        }
        return;
      }
    },
    declareAlternate(suit) {
      this.$socket.emit("declareAlternate", suit);
    },
    deal(hand) {
      this.$parent.hand = hand;
      this.dealDone = false;
      this.dealCount = 1;
      let dealInterval = setInterval(() => {
        EventBus.$emit("card-dealt");
        this.dealCount++;
        if (this.dealCount == 6) {
          setTimeout(() => {
            this.showCards = true;
          }, 450);
          clearInterval(dealInterval);
        }
      }, 450);
    },
    getCardImage(val) {
      return utilities.getCardImage(val);
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../scss/button.scss";
@import "../scss/common.scss";

#hand-container {
  display: block;
  position: absolute;
  bottom: 5%;
  z-index: 10;
}

#declare-alternate-list-item {
  float: right;
  list-style: none;

  button {
    margin-right: 0.5rem;
  }
}
</style>