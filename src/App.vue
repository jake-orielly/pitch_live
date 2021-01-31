<template>
  <div>
    <div v-if="gameStage == 'lobby'">
      <UserOptions v-if="showingUserOptionsContainer" />
      <GameLobby
        v-if="signedIn"
        :username="username"
        :gameStarting="gameStarting"
      />
    </div>
    <div v-if="gameStage == 'playing'">
      <div>
        <p id="status-text">{{ statusText }}</p>
        <BidOptions 
          :bidding="bidding"
        />
      </div>
      <div id="game-info-container">
        <ScoreContainer 
          :score="score" 
        />
        <TrumpSuitContainer />
        <LeadSuitContainer/>
      </div>
      <DeckCards />
      <GameOverContainer />
      <PlayedPile 
        :othersCards="othersCards"
        :myCard="myCard"
      />
      <OthersHand
        :username="$store.state.users[0].username"
        :numCards="6"
        :playerClass="'opponent-0'"
      />
      <OthersHand
        :username="$store.state.users[1].username"
        :numCards="6"
        :playerClass="'teammate-1'"
      />
      <OthersHand
        :username="$store.state.users[2].username"
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
import GameOverContainer from "./components/GameOverContainer.vue";
import HandContainer from "./components/HandContainer.vue";
import LeadSuitContainer from "./components/LeadSuitContainer.vue";
import OthersHand from "./components/OthersHand.vue";
import PlayedPile from "./components/PlayedPile.vue";
import ScoreContainer from "./components/ScoreContainer.vue";
import TrumpSuitContainer from "./components/TrumpSuitContainer.vue";
import UserOptions from "./components/UserOptions.vue";

import utilities from "./js/utilities.js";

export default {
  name: "App",
  data() {
    return {
      hand: [],
      statusText: "",
      bidding: false,
      currPlay: false,
      score: [0, 0],
      nums: [1, 2, 3, 4, 5, 6],
      gameStage: "lobby",
      signedIn: false,
      id: "",
      username: "",
      gameStarting: 0,
      currTrick: 0,
      othersCards: ["placeholder", "placeholder", "placeholder"],
      myCard: "placeholder",
      showingUserOptionsContainer: true,
    };
  },
  components: {
    BidOptions,
    ChatBox,
    DeckCards,
    GameLobby,
    GameOverContainer,
    HandContainer,
    LeadSuitContainer,
    OthersHand,
    PlayedPile,
    ScoreContainer,
    TrumpSuitContainer,
    UserOptions,
  },
  sockets: {
    connect: function () {
      this.$store.commit("setId", this.$socket.id);
    },
    setProp(data) {
      if (data.isJson) data.val = JSON.parse(data.val);
      this[data.prop] = data.val;
    },
    callStoreMutation(data) {
      this.$store.commit(data.mutation, data.val);
    },
    status(data) {
      this.statusText = data;
    },
    newTrick() {
      this.newTrick();
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
      function findUser(element) {
        return element.username == data.user;
      }
      let theirIndex = this.$store.state.users.findIndex(findUser);
      console.log(this.othersCards, data.card, theirIndex)
      this.$set(this.othersCards, theirIndex, data.card);
      console.log(this.othersCards)
    },
    newTrick() {
      this.othersCards = ["placeholder", "placeholder", "placeholder"];
      this.myCard = "placeholder";
    },
    getCardImage(val) {
      return utilities.getCardImage(val);
    },
  },
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,700;1,400;1,700&display=swap');
</style>

<style>
html,
body {
  margin: 5px 5px 5px 1em;
  padding: 0;
  background: seagreen;
  user-select: none;
  font-family: 'Montserrat', sans-serif;
}

#status-text {
  font-size: 1.5rem;
  color: white;
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

.clubs,
.spades {
  color: black;
}

.hearts,
.diamonds {
  color: red;
}

#game-info-container {
  position: absolute;
  top: 0rem;
  right: 2rem;
}
</style>