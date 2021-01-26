<template>
  <div>
      <div v-if="game_stage == 'lobby'">
          <div id="username-container">
              <button class="ui-button user-option-button" @click="set_user_mode('guest')">Play As Guest</button>
              <button class="ui-button user-option-button" @click="set_user_mode('existing')">Login</button>
              <button class="ui-button user-option-button" @click="set_user_mode('new')">Sign Up</button>
              <form id="login-form">
                  <input class="login-input" id="username-input" type="text" placeholder="Username" v-if="user_mode" autocomplete="off" required/>
                  <input class="login-input" id="password-input" type="password" placeholder="Password" v-if="user_mode == 'new' || user_mode == 'existing'" required/>
                  <input class="ui-button" type="submit" id="username-confirm" v-if="user_mode" :value="user_confirm[user_mode]" @click="confirm_click">
              </form>
              <p>{{login_status_map[login_status]}}</p>
              <p>{{signup_status}}</p>
          </div>
          <div v-if="signed_in">
              <p>In This Lobby:</p>
              <table class="user-list">
                  <tr v-for="user in users" v-bind:key="user" class="unselectable">
                      <td>{{user.username}}</td>
                      <td @click="ready_click(user.username,false)" :class="{clickable : user.username == username}" v-if="user.ready"><span class="ready-mark">&#10004;</span></td>
                      <td @click="ready_click(user.username,true)" :class="{clickable : user.username == username}" v-if="!user.ready"><span class="not-ready-mark">&#10006;</span></td>
                  </tr>
              </table>
              <div v-if="game_starting">
                  <p>Game starting in {{game_starting}}</p>
                  <button @click="ready_click('self',false)">Cancel</button>
              </div>
          </div>
      </div>
      <div v-if="game_stage == 'playing'">
          <p>Trump: <span :class="(trump_suit ? trump_suit.toLowerCase() : '')">{{suit_to_icon(trump_suit)}}</span></p>
          <p>Lead: 
              <span :class="(lead_suit ? lead_suit.toLowerCase() : '')">{{suit_to_icon(lead_suit)}}</span>
              <span v-if="leader">Held by {{leader}}</span>
          </p>
          <div>
              <p id="status-text">{{status_text}}</p>
              <p v-if="status == 'bidder'" class="bid-div">Bid: 
                  <button class="clickable bid-button" v-for="i in ['pass',2,3,4,5]
                  .filter(bid => bid > curr_bid || 
                  (bid > 0 && curr_bid == 'pass') ||
                  (bid == 'pass' && (!dealer || curr_bid != 'pass')) ||
                  (dealer && bid == curr_bid && curr_bid != 'pass'))"
                      @click="bid(i)"
                      v-bind:key="'bid-' + i">{{i}}</button>
              </p>
              <!-- <p>{{curr_bid + ' : ' + dealer}}</p> -->
          </div>
          <div>
              <p class="score-text">Score: {{score[0]}} | {{score[1]}}</p>
          </div>
          <div id="deck-container">
              <ul>
                  <li class="card-list" v-for="num in 20" v-bind:key="'card-' + num">
                      <img class="deck-card" v-bind:src="get_card_image('back')">
                  </li>
              </ul>
          </div>
          <div id="played-pile">
              <img v-for="i in 3" v-bind:key="'played-card-' + i" class="deck-card played" :id="'played-pos-' + (i-1)" v-bind:src="get_card_image(others_cards[i-1])">
              <img class="deck-card played" id="played-pos-3" v-bind:src="get_card_image(my_card)">
          </div>
          <div class="opponent-0 rotate-90">
              <p class="nametag">{{users[0].username}}</p>
              <img v-for="i in 6" 
              v-bind:key="'oponent-1-card-' + i"
              v-bind:style="{transform: 'rotate(' + (i - 3.5)*5 + 'deg)' }"
              class="other-player-card opponent-0-card" v-bind:src="get_card_image('back')">
          </div>
          <div class="teammate-1">
              <p class="nametag">{{users[1].username}}</p>
              <img v-for="i in 6" 
              v-bind:key="'teamate-card-' + i"
              v-bind:style="{transform: 'rotate(' + (i - 3.5)*5 + 'deg)' }"
              class="other-player-card" v-bind:src="get_card_image('back')">
          </div>
          <div class="opponent-1 rotate-270">
              <p class="nametag">{{users[2].username}}</p>
              <img v-for="i in 6" 
              v-bind:key="'oponent-2-card' + i"
              v-bind:style="{transform: 'rotate(' + (i - 3.5)*5 + 'deg)' }"
              class="other-player-card opponent-1-card" v-bind:src="get_card_image('back')">
          </div>
          <div id="hand-container">
              <ul>
                  <li v-for="card in hand" v-bind:key="'card-' + card" @click="play(card)" class="hand-card-slot card-list">
                      <img class="card hand-card" v-bind:src="get_card_image(card)">
                  </li>
              </ul>
          </div>
      </div>
      <div id="chat-container" v-if="signed_in">
          <div id="messages"></div>
          <div id="chat-ui-container">
              <input id="message" type="text" placeholder="Message" />
              <button id="send" class="send-button">Send</button>
          </div>
      </div>
  </div>
</template>
<script src="./chat.js"></script>
<script src="./ui_functions.js"></script>
<script>
export default {
  name: 'App',
  data() {
    return {
      message: 'Hello Vue!',
      socket: undefined,
      hand: [],
      status: '',
      status_text: '',
      dealer: false,
      curr_play: false,
      deal_done: false,
      score: [0,0],
      nums: [1,2,3,4,5,6],
      game_stage: 'lobby',
      signed_in: false,
      users: [],
      username: '',
      game_starting: 0,
      trump_suit: '',
      lead_suit: '',
      leader: '',
      curr_bout: 0,
      others_cards: ['placeholder','placeholder','placeholder'],
      my_card: 'placeholder',
      curr_bid: undefined,
      login_status: undefined,
      login_status_map: {'success':'Success','failure':'Password Incorrect','bad-user':'User does not exist'},
      signup_status: undefined,
      user_confirm: {'guest':'Confirm','existing':'Log In','new':'Sign Up'},
      user_mode: ''
    }
  },
  methods: {
      confirm_click() {
          switch(this.user_mode) {
              case 'guest':
                  this.guest_confirm();
                  break;
              case 'existing':
                  this.login();
                  break;
              case 'new':
                  this.create_account();
                  break;
          }
      },
      set_user_mode(given) {
          this.user_mode = given;
          setTimeout(()=>{
              $('#username-input').focus()
          },2)
      },
      guest_confirm() {
          submitUsername();
      },
      login(){
          const Http = new XMLHttpRequest();
          let username = $('#username-input').val();
          let password = $('#password-input').val();
          const url=`http://23.254.164.217:8000/login?user=${username}&password=${password}`;
          Http.open("POST", url);
          Http.send();
      
          Http.onreadystatechange = (e) => {
              if (Http.readyState == 4) {
                  var result = JSON.parse(Http.responseText)
                  this.login_status = result.message;
              }
          }
      },
      create_account(){
          const Http = new XMLHttpRequest();
          let username = $('#username-input').val();
          let password = $('#password-input').val();
          const url=`http://23.254.164.217:8000/sign-up?user=${username}&password=${password}`;
          Http.open("POST", url);
          Http.send();
      
          Http.onreadystatechange = (e) => {
              if (Http.readyState == 4) {
                  var result = JSON.parse(Http.responseText)
                  if (result.message)
                      this.signup_status = result.message;
                  else if (result.error)
                      this.signup_status = 'Error: ' + result.error;
                  else
                      this.signup_status = 'Error: Uknown Error';
              }
          }
      },
      bid(given) {
          this.socket.emit('bid',given);
          this.status = ''
          this.status_text = ''
      },
      ready_click(name,ready) {
          console.log('Ready:',name,ready)
          if (name == 'self')
              name = this.username;
          if (name == this.username)
              this.socket.emit('ready',ready);
      },
      play(card) {
          if (this.curr_play && !card.played) {
              let legal = true;
              if (this.lead_suit && this.lead_suit != card.suit && this.trump_suit != card.suit)
                  for (var i = 0; i < this.hand.length; i++)
                      if (this.hand[i].suit == this.lead_suit)
                          legal = false;
              if (!legal)
                  alert("Illegal move, you must follow")
              else {
                  this.socket.emit('play',card)
                  this.curr_play = false;
                  for (let i = 0; i < this.hand.length; i++)
                      if (this.hand[i].suit == card.suit && this.hand[i].num == card.num) {
                          card.played = true;
                          this.hand.splice(i,1)
                          //let destination = document.getElementById("played-pos-3");
                          //let target = document.getElementsByClassName("hand-card")[i];
                          //console.log(destination,target)
                          //this.move_card(destination,target);
                          this.my_card = card;
                          this.curr_bout++;
                          break;
                      }
              }
              return;
          }
      },
      other_played(data) {
          /*let target;
          let destination;
          let opponents;
          let my_team = this._data.users.filter(user => user.username == this.username)[0].team;
          let their_team = this._data.users.filter(user => user.username == data.user)[0].team;*/
          function find_user(element) {
              return element.username == data.user;
          }
          let their_index = this.users.findIndex(find_user);
          Vue.set(this.others_cards, their_index, data.card);
          /*if (my_team == their_team) {
              target = document.getElementsByClassName("teammate-1")[this.curr_bout];
              destination = document.getElementById("played-pos-1");
          }
          else {
              opponents = this.users.filter(user => user.team == 1);
              for (var i = 0; i < opponents.length; i++)
                  if (opponents[i].username == data.user) {
                      console.log("opponent-" + i + "-card")
                      target = document.getElementsByClassName("opponent-" + i + "-card")[this.curr_bout];
                      destination = document.getElementById("played-pos-" + i*2);
                  }
          }
          console.log("Other play")
          console.log(target)
          console.log(destination)
          this.move_card(destination,target);*/

      },
      new_bout() {
          this.others_cards = ['placeholder','placeholder','placeholder'];
          this.my_card = 'placeholder';
      },
      deal(hand) {
          let count = 0;
          this.hand = hand;
          this.deal_done = false;
          document.getElementById('hand-container').style.display = "block";
          let interval = setInterval(function() {
              if (count == 6) {
                  interval = clearInterval(interval);
                  this.deal_done = true;
                  setTimeout(()=>vue_app.card_switch(),700)
              }
              else
                  count = vue_app.deal_card(count);
          },500)
      },
      deal_card(num) {
          let destination = document.getElementsByClassName("card hand-card")[num];
          let target = document.getElementsByClassName("deck-card")[num];
          this.move_card(destination,target);
          return num + 1;
      },
      move_card(destination,target) {
          let dest_rect = destination.getBoundingClientRect();
          target.style.position = 'absolute'; 
          target.style.top = dest_rect.y + 'px';
          target.style.left = dest_rect.x + 'px';
          target.style["z-index"] = 10 + this.curr_bout;
      },
      card_switch() {
          let card_backs = document.getElementsByClassName('deck-card');
          let hand_cards = document.getElementsByClassName('hand-card');
          for (var i = 0; i < 6; i++)
              card_backs[i].style.display = "none";
          for (var i = 0; i < hand_cards.length; i++)
              hand_cards[i].style.visibility = "visible";
          
      },
      get_card_image(card) {
          if (card == 'back')
              return 'cards/red_back.png';
          if (card == 'placeholder')
              return 'cards/placeholder.png';
          let face_map = {'Jack':'J','Queen':'Q','King':'K','Ace':'A'}
          let num = card.num;
          if (isNaN(num))
              num = face_map[num];
          return 'cards/' + num + card.suit[0] + '.png'
      },
      suit_to_icon(suit) {
          switch(suit) {
          case 'Clubs':
              return '♣';
          case 'Diamonds':
              return '♦';
          case 'Hearts':
              return '♥';
          case 'Spades':
              return '♠';
          default:
              return '';
          }
      }
  }
}
</script>

<style>
html, body {
    margin: 5px 5px 5px 1em;
    padding: 0;
    background: seagreen;
    user-select: none;
}

p, .ui-button, input {
    font-size: 2rem;
}

@media only screen and (max-width: 1200px)  {
    p, .ui-button, input {
        font-size: 1.5rem;
    }    
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

.login-input::placeholder { /* Chrome, Firefox, Opera, Safari 10.1+ */
    color: white;
    opacity: 1; /* Firefox */
}

p, .ui-button, .user-list {
    color: white;
}

.user-list {
    font-size: 3rem;
}

.user-list td {
    padding-right: 1em;
}

.ready-mark {
    color: #68ff68;
}

.not-ready-mark {
    color: #dc0202;
}

.ready-mark, .not-ready-mark {
    text-shadow: 2px 3px 7px black;
}

.user-option-button {
    display: block; 
    margin: 0 auto;
    margin: 2rem auto;
    font-size: 2.5rem;
}

.user-option-button:first-child {
    margin-top: 10%;
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

.message-text {
    color: black;
}

.message-text, #message {
    font-size: 1rem;
}

.clickable {
    cursor:pointer;
    user-select: none;
}

.unselectable {
    user-select: none;
}

.send-button {
    background: #ffffff;
    border: 3px solid #00467d;
    box-shadow: 2px 2px 9px #0000009c;
    border-radius: 0.5rem;
    color: #00467d;
}

#username-container {
    text-align: center;
}

#chat-container {
    display:inline-block;
    position: absolute;
    right: 2em;
    bottom:1em;
    background-color: lightgrey;
    border-radius: 1em;
    padding: 1em;
    box-shadow: 3px 3px 4px #0000008f;
}

.score-text {
    position: absolute;
    top: 0;
    right: 5em;
}

#messages {
    height: 22rem;
    width: 22rem;
    overflow-y: scroll;
}

.card, .deck-card, .other-player-card {
    width:6.5em;
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
    top: 35%
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

.clubs, .spades {
    color: black;
}

.hearts, .diamonds {
    color: red;
}
</style>
