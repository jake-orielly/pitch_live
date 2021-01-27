<template>
  <div>
    <div v-if="gameStage == 'lobby'">
      <UserOptions v-if="showingUserOptionsContainer" />
      <GameLobby
        v-if="signedIn"
        :users="users"
        :username="username"
        :gameStarting="gameStarting"
      />
    </div>
    <div v-if="gameStage == 'playing'">
      <p>
        Trump:
        <span :class="trumpSuit ? trumpSuit.toLowerCase() : ''">{{
          suitToIcon(trumpSuit)
        }}</span>
      </p>
      <p>
        Lead:
        <span :class="leadSuit ? leadSuit.toLowerCase() : ''">{{
          suitToIcon(leadSuit)
        }}</span>
        <span v-if="leader">Held by {{ leader }}</span>
      </p>
      <div>
        <p id="status-text">{{ statusText }}</p>
        <BidOptions />
        <!-- <p>{{currBid + ' : ' + dealer}}</p> -->
      </div>
      <ScoreContainer :score="score" />
      <DeckCards />
      <div id="played-pile">
        <img
          v-for="i in 3"
          v-bind:key="'played-card-' + i"
          class="deck-card played"
          :id="'played-pos-' + (i - 1)"
          v-bind:src="getCardImage(others_cards[i - 1])"
        />
        <img
          class="deck-card played"
          id="played-pos-3"
          v-bind:src="getCardImage(myCard)"
        />
      </div>
      <OthersHand
        :username="users[0].username"
        :numCards="6"
        :playerClass="'opponent-0'"
      />
      <OthersHand
        :username="users[1].username"
        :numCards="6"
        :playerClass="'teammate-1'"
      />
      <OthersHand
        :username="users[2].username"
        :numCards="6"
        :playerClass="'opponent-1'"
      />
      <HandContainer
        :hand="hand"
        ref="handContainer"
      />
    </div>
    <ChatBox v-if="signedIn" :username="username" />
  </div>
</template>
<script src="./chat.js"></script>
<script src="./ui_functions.js"></script>
<script>
import BidOptions from "./components/BidOptions.vue";
import ChatBox from "./components/ChatBox.vue";
import DeckCards from "./components/DeckCards.vue"
import GameLobby from "./components/GameLobby.vue";
import HandContainer from "./components/HandContainer.vue";
import OthersHand from "./components/OthersHand.vue";
import ScoreContainer from "./components/ScoreContainer.vue";
import UserOptions from "./components/UserOptions.vue";

import utilities from "./js/utilities.js";

export default {
  name: "App",
  data() {
    return {
      hand: [],
      status: "",
      statusText: "",
      dealer: false,
      currPlay: false,
      score: [0, 0],
      nums: [1, 2, 3, 4, 5, 6],
      gameStage: "lobby",
      signedIn: false,
      users: [],
      username: "",
      gameStarting: 0,
      trumpSuit: "",
      leadSuit: "",
      leader: "",
      currBout: 0,
      others_cards: ["placeholder", "placeholder", "placeholder"],
      myCard: "placeholder",
      currBid: undefined,
      showingUserOptionsContainer: true,
    };
  },
  components: {
    BidOptions,
    ChatBox,
    DeckCards,
    GameLobby,
    HandContainer,
    OthersHand,
    ScoreContainer,
    UserOptions,
  },
  sockets: {
    setProp(data) {
      if (data.isJson) data.val = JSON.parse(data.val);
      this[data.prop] = data.val;
    },
    status(data, bid) {
      console.log(data,bid)
      if (bid) {
        this.currBid = bid.amount;
        if (typeof bid.amount == "number")
          this.statusText += " - " + bid.player + " has it with " + bid.amount;
      }
      else 
        this.currBid = 0;
      this.statusText = data;
      this.status = "bidder";
    },
    newBout() {
      this.newBout();
    },
    deal(hand) {
      this.$refs.handContainer.deal(hand);
    },
    played(data) {
      this.otherPlayed(data);
    },
  },
  destroy() {
    this.$socket.disconnect();
  },
  methods: {
    otherPlayed(data) {
      /*let target;
          let destination;
          let opponents;
          let my_team = this._data.users.filter(user => user.username == this.username)[0].team;
          let their_team = this._data.users.filter(user => user.username == data.user)[0].team;*/
      function findUser(element) {
        return element.username == data.user;
      }
      let their_index = this.users.findIndex(findUser);
      this.set(this.others_cards, their_index, data.card);
      /*if (my_team == their_team) {
              target = document.getElementsByClassName("teammate-1")[this.currBout];
              destination = document.getElementById("played-pos-1");
          }
          else {
              opponents = this.users.filter(user => user.team == 1);
              for (var i = 0; i < opponents.length; i++)
                  if (opponents[i].username == data.user) {
                      console.log("opponent-" + i + "-card")
                      target = document.getElementsByClassName("opponent-" + i + "-card")[this.currBout];
                      destination = document.getElementById("played-pos-" + i*2);
                  }
          }
          console.log("Other play")
          console.log(target)
          console.log(destination)
          this.moveCard(destination,target);*/
    },
    newBout() {
      this.others_cards = ["placeholder", "placeholder", "placeholder"];
      this.myCard = "placeholder";
    },
    suitToIcon(suit) {
      switch (suit) {
        case "Clubs":
          return "♣";
        case "Diamonds":
          return "♦";
        case "Hearts":
          return "♥";
        case "Spades":
          return "♠";
        default:
          return "";
      }
    },
    getCardImage(val) {
      return utilities.getCardImage(val);
    },
  },
};
</script>

<style>
html,
body {
  margin: 5px 5px 5px 1em;
  padding: 0;
  background: seagreen;
  user-select: none;
}

p,
.ui-button,
input {
  font-size: 2rem;
}

@media only screen and (max-width: 1200px) {
  p,
  .ui-button,
  input {
    font-size: 1.5rem;
  }
}

p,
.ui-button,
.user-list {
  color: white;
}

.login-input {
  display: block;
  margin: 0.5em auto;
  background: none;
  border: none;
  color: white;
  text-align: center;
  padding: 0.5em;
  border-bottom: 2px solid white;
}

.login-input:focus {
  outline: none;
}

.login-input::placeholder {
  /* Chrome, Firefox, Opera, Safari 10.1+ */
  color: white;
  opacity: 1; /* Firefox */
}

.ui-button {
  background: none;
  border: 3px solid white;
  box-shadow: 1px 1px 9px #0000009c;
  border-radius: 0.5rem;
}

.ui-button:hover {
  box-shadow: 2px 2px 9px #000000de;
  transform: scale(1.01) translateY(-2px);
}

.ui-button:active {
  outline: none;
  box-shadow: 1px 1px 5px #00000085;
  transform: scale(0.99) translateY(2px);
}

.ui-button:focus {
  outline: none;
}

.nametag {
  background-color: white;
  color: black;
  text-align: center;
  border: 4px solid black;
  border-radius: 9px;
  box-shadow: 1px 1px 9px #0000009c;
  position: absolute;
  z-index: 30;
  padding: 0em 1em;
}

.clickable {
  cursor: pointer;
  user-select: none;
}

.card,
.deck-card,
.other-player-card {
  width: 6.5em;
}

.card {
  margin-right: 1em;
}

.deck-card {
  margin-right: -6.4em;
  transition: 1s;
}

.card-list {
  list-style: none;
  display: inline;
}

#played-pile {
  position: absolute;
  left: calc(50% - 6.5em);
  top: calc(50% - 8em);
}

.bid-div {
  position: absolute;
  top: 9em;
  left: 37%;
  z-index: 10;
}

.played {
  position: absolute;
}

#played-pos-0 {
  left: -3.5em;
}

#played-pos-1 {
  top: -3.5em;
}

#played-pos-2 {
  left: 3.5em;
}

#played-pos-3 {
  top: 3.5em;
}

.clubs,
.spades {
  color: black;
}

.hearts,
.diamonds {
  color: red;
}
</style>
