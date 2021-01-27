<template>
  <div>
    <div v-if="gameStage == 'lobby'">
      <UserOptions v-if="showingUserOptionsContainer" />
      <GameLobby v-if="signedIn" :users="users" :username="username" :gameStarting="gameStarting" />
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
        <p v-if="status == 'bidder'" class="bid-div">
          Bid:
          <button
            class="clickable bid-button"
            v-for="i in ['pass', 2, 3, 4, 5].filter(
              (bid) =>
                bid > currBid ||
                (bid > 0 && currBid == 'pass') ||
                (bid == 'pass' && (!dealer || currBid != 'pass')) ||
                (dealer && bid == currBid && currBid != 'pass')
            )"
            @click="bid(i)"
            v-bind:key="'bid-' + i"
          >
            {{ i }}
          </button>
        </p>
        <!-- <p>{{currBid + ' : ' + dealer}}</p> -->
      </div>
      <div>
        <p class="score-text">Score: {{ score[0] }} | {{ score[1] }}</p>
      </div>
      <div id="deck-container">
        <ul>
          <li class="card-list" v-for="num in 20" v-bind:key="'card-' + num">
            <img class="deck-card" v-bind:src="getCardImage('back')" />
          </li>
        </ul>
      </div>
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
      <div class="opponent-0 rotate-90">
        <p class="nametag">{{ users[0].username }}</p>
        <img
          v-for="i in 6"
          v-bind:key="'oponent-1-card-' + i"
          v-bind:style="{ transform: 'rotate(' + (i - 3.5) * 5 + 'deg)' }"
          class="other-player-card opponent-0-card"
          v-bind:src="getCardImage('back')"
        />
      </div>
      <div class="teammate-1">
        <p class="nametag">{{ users[1].username }}</p>
        <img
          v-for="i in 6"
          v-bind:key="'teamate-card-' + i"
          v-bind:style="{ transform: 'rotate(' + (i - 3.5) * 5 + 'deg)' }"
          class="other-player-card"
          v-bind:src="getCardImage('back')"
        />
      </div>
      <div class="opponent-1 rotate-270">
        <p class="nametag">{{ users[2].username }}</p>
        <img
          v-for="i in 6"
          v-bind:key="'oponent-2-card' + i"
          v-bind:style="{ transform: 'rotate(' + (i - 3.5) * 5 + 'deg)' }"
          class="other-player-card opponent-1-card"
          v-bind:src="getCardImage('back')"
        />
      </div>
      <div id="hand-container">
        <ul>
          <li
            v-for="card in hand"
            v-bind:key="'card-' + card"
            @click="play(card)"
            class="hand-card-slot card-list"
          >
            <img class="card hand-card" v-bind:src="getCardImage(card)" />
          </li>
        </ul>
      </div>
    </div>
    <ChatBox v-if="signedIn" :username="username" />
  </div>
</template>
<script src="./chat.js"></script>
<script src="./ui_functions.js"></script>
<script>
import ChatBox from "./components/ChatBox.vue";
import GameLobby from "./components/GameLobby.vue";
import UserOptions from "./components/UserOptions.vue";

export default {
  name: "App",
  data() {
    return {
      message: "Hello Vue!",
      socket: undefined,
      hand: [],
      status: "",
      statusText: "",
      dealer: false,
      currPlay: false,
      dealDone: false,
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
    ChatBox,
    GameLobby,
    UserOptions
  },
  sockets: {
    setProp(data) {
      if (data.isJson) data.val = JSON.parse(data.val);
      this[data.prop] = data.val;
    },
  },
  methods: {
    chatSetup() {
      this.$socket.on("newBout", function () {
        this.newBout();
      });

      this.$socket.on("deal", function (hand) {
        console.log(hand);
        this.deal(hand);
      });

      this.$socket.on("played", function (data) {
        this.otherPlayed(data);
      });

      // Listen for status events
      this.$socket.on("status", function (data, bid) {
        if (bid) {
          this.currBid = bid.amount;
          if (typeof bid.amount == "number")
            this.statusText +=
              " - " + bid.player + " has it with " + bid.amount;
          this.status = "bidder";
        }
        this.statusText = data;
      });
    },
    bid(given) {
      this.$socket.emit("bid", given);
      this.status = "";
      this.statusText = "";
    },
    play(card) {
      if (this.currPlay && !card.played) {
        let legal = true;
        if (
          this.leadSuit &&
          this.leadSuit != card.suit &&
          this.trumpSuit != card.suit
        )
          for (var i = 0; i < this.hand.length; i++)
            if (this.hand[i].suit == this.leadSuit) legal = false;
        if (!legal) alert("Illegal move, you must follow");
        else {
          this.$socket.emit("play", card);
          this.currPlay = false;
          for (let i = 0; i < this.hand.length; i++)
            if (
              this.hand[i].suit == card.suit &&
              this.hand[i].num == card.num
            ) {
              card.played = true;
              this.hand.splice(i, 1);
              //let destination = document.getElementById("played-pos-3");
              //let target = document.getElementsByClassName("hand-card")[i];
              //console.log(destination,target)
              //this.moveCard(destination,target);
              this.myCard = card;
              this.currBout++;
              break;
            }
        }
        return;
      }
    },
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
      Vue.set(this.others_cards, their_index, data.card);
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
    deal(hand) {
      let count = 0;
      this.hand = hand;
      this.dealDone = false;
      document.getElementById("hand-container").style.display = "block";
      let interval = setInterval(function () {
        if (count == 6) {
          interval = clearInterval(interval);
          this.dealDone = true;
          setTimeout(() => vue_app.cardSwitch(), 700);
        } else count = vue_app.dealCard(count);
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
      let card_backs = document.getElementsByClassName("deck-card");
      let hand_cards = document.getElementsByClassName("hand-card");
      for (var i = 0; i < 6; i++) card_backs[i].style.display = "none";
      for (var i = 0; i < hand_cards.length; i++)
        hand_cards[i].style.visibility = "visible";
    },
    getCardImage(card) {
      if (card == "back") return "cards/red_back.png";
      if (card == "placeholder") return "cards/placeholder.png";
      let face_map = { Jack: "J", Queen: "Q", King: "K", Ace: "A" };
      let num = card.num;
      if (isNaN(num)) num = face_map[num];
      return "cards/" + num + card.suit[0] + ".png";
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

.score-text {
  position: absolute;
  top: 0;
  right: 5em;
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

.hand-card {
  visibility: hidden;
}

#played-pile {
  position: absolute;
  left: calc(50% - 6.5em);
  top: calc(50% - 8em);
}

#hand-container {
  position: absolute;
  bottom: 5%;
  z-index: 10;
}

.bid-div {
  position: absolute;
  top: 9em;
  left: 37%;
  z-index: 10;
}

.bid-button {
  margin-left: 0.25em;
}

.rotate-90 {
  transform: rotate(90deg);
}

.rotate-270 {
  transform: rotate(270deg);
}

.opponent-0 {
  position: absolute;
  left: 4em;
  top: 35%;
}

.opponent-1 {
  position: absolute;
  right: 4em;
  top: 35%;
}

.teammate-1 {
  position: absolute;
  left: 42%;
  top: 4em;
}

.other-player-card {
  margin-right: -2.5em;
  margin-left: -2.5em;
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
