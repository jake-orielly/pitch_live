<template>
  <div id="hand-container">
    <ul>
      <li
        v-for="(card, ind) in hand"
        v-bind:key="'hand-card-' + ind"
        @click="play(card)"
        class="hand-card-slot card-list"
      >
        <img class="card hand-card" v-bind:src="getCardImage(card)" />
      </li>
    </ul>
  </div>
</template>

<script>
import utilities from "../js/utilities.js"

export default {
  props: {
    hand: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      dealDone: false,
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
              this.$parent.currBout++;
              break;
            }
        }
        return;
      }
    },
    deal(hand) {
      let count = 0;
      this.$parent.hand = hand;
      this.dealDone = false;
      document.getElementById("hand-container").style.display = "block";
      let interval = setInterval(() => {
        if (count == 6) {
          interval = clearInterval(interval);
          this.dealDone = true;
          setTimeout(() => this.cardSwitch(), 700);
        } else count = this.dealCard(count);
      }, 500);
    },
    dealCard(num) {
      let destination = document.getElementsByClassName("card hand-card")[num];
      let target = document.getElementsByClassName("deck-card")[num];
      this.moveCard(destination, target);
      return num + 1;
    },
    moveCard(destination, target) {
      let dest_rect = destination.getBoundingClientRect();
      target.style.position = "absolute";
      target.style.top = dest_rect.y + "px";
      target.style.left = dest_rect.x + "px";
      target.style["z-index"] = 10 + this.currBout;
    },
    cardSwitch() {
      let cardBacks = document.getElementsByClassName("deck-card");
      let handCards = document.getElementsByClassName("hand-card");
      for (let i = 0; i < 6; i++) 
        cardBacks[i].style.display = "none";
      for (let i = 0; i < handCards.length; i++)
        handCards[i].style.visibility = "visible";
    },
    getCardImage(val) {
      return utilities.getCardImage(val);
    }
  },
};
</script>

<style scoped>

#hand-container {
  position: absolute;
  bottom: 5%;
  z-index: 10;
}

.hand-card {
  visibility: hidden;
}
</style>