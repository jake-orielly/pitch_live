const path = require('path');
const express = require('express');
const app = express();

const http = require('http').Server(app);
const io = require('socket.io')(http, {
  cors: {
    origin: "http://vps:8080",
    methods: ["GET", "POST"],
    credentials: true
  }
});
const port = 3000;

var gameStartCountdown;

const htmlPath = path.join(__dirname, 'public');

const constants = require('./constants.js');
const deckFunctions = require('./deck_functions.js');
const gameFunctions = require('./game_functions.js');
const Lobby = require('./lobby_class.js')

app.use(express.static(htmlPath));
http.listen(port, function () {
  console.log('listening on *:' + port);
});

var users = [];
var score = [0, 0];
var gameOver = false;
var currPlayerNum, currBid, currPlayer, trumpSuit, leadSuit, currTrick, lastDealer;
var lobbies = [new Lobby()];

console.log(lobbies[0].id)

io.on('connection', function (socket) {
  socket.on('chat', function (msg) {
    io.emit('chat', msg);
  });
  socket.on('bid', recieveBid);

  socket.on('joinLobby', function(id) {
    let lobby = lobbies.filter(
      l => l.id == id
    )[0];
    if (!lobby)
      socket.emit('joinFailed');
    else {
      socket.emit('joinSucceeded');
      socket.lobby = lobby
    }
  });

  socket.on('usernameSubmission', function (data) {
    let newUser = { 
      username: data['usernameSubmission'], 
      ready: false, 
      socket: socket,
      teamNum: users.length % 2,
      cards: 0
    };
    let options;
    let partOfSpeech;
    users.push(newUser);
    socket.broadcast.emit('chat', `${data['usernameSubmission']} has joined`);
    partOfSpeech = (parseInt((users.length - 1 ) / 2) == 1 ? "nouns" : "adjectives");
    teammatePartOfSpeech = (partOfSpeech == "nouns" ? "adjectives" : "nouns");
    options = socket.lobby.teamWords[(users.length - 1) % 2][partOfSpeech];
    socket.emit('callStoreMutation', {
      mutation:'setTeamWordOptions', 
      val: {
        partOfSpeech,
        options
      }
    });
    callStoreMutation('setTeamNames', [socket.lobby.teams[0].name, socket.lobby.teams[1].name]);
    sendUpdatedUsers();
  });

  socket.on('disconnect', function () {
    let pos;
    for (let i = 0; i < users.length; i++)
      if (users[i].socket.id == socket.id)
        pos = i;
    if (users[pos]) {
      io.emit('chat', `${users[pos].username} has left`);
      users.splice(pos, 1);
      sendUpdatedUsers();
    }
  });

  socket.on('ready', function (ready) {
    //let count = 5;
    let count = 1;
    users.filter(user => user.socket == socket)[0].ready = ready;
    sendUpdatedUsers();
    if (count && !ready) {
      clearInterval(gameStartCountdown);
      setProp('gameStarting', 0);
    }
    else if (users.filter(user => !user.ready).length == 0 && users.length == 4) {
      setProp('gameStarting', count);
      gameStartCountdown = setInterval(function () {
        count--;
        setProp('gameStarting', count);
        if (count == 0) {
          clearInterval(gameStartCountdown);
          callStoreMutation('setTeamNames', [
            socket.lobby.teams[0].name, 
            socket.lobby.teams[1].name
          ]);
          setProp('gameStage', 'playing')
          setTimeout(dealCards, 500);
        }
      }, 1000);
    }
  });

  socket.on('play', function (card) {
    let winning;
    sendChat(`${currPlayer.username} played the ${card.num} of ${card.suit}`);
    currPlayer.cards--;
    sendUpdatedUsers();
    socket.broadcast.emit('played', { card: card, id: currPlayer.socket.id });
    currTrick.push({ user: currPlayer, card: card });
    if (!trumpSuit) {
      trumpSuit = card.suit
      callStoreMutation('setTrumpSuit', card.suit)
    }
    if (!leadSuit) {
      leadSuit = card.suit
      callStoreMutation('setLeadSuit', card.suit)
    };
    winning = gameFunctions.evalWinner(currTrick, trumpSuit, leadSuit);
    callStoreMutation('setLeader', winning.user.username)
    if (currPlayerNum == users.length - 1) {
      awardWinner(winning, socket.lobby);
    }
    else
      nextTrick();
  });

  socket.on('selectTeamWord', function(data) {
    let position = (data.partOfSpeech == 'adjectives' ? 0 : 1);
    socket.lobby.teams[data.teamNum].name[position] = data.val;
    callStoreMutation('setTeamNames', [
      socket.lobby.teams[0].name, 
      socket.lobby.teams[1].name
    ]);
  });
});

function sendUpdatedUsers() {
  let simpleUsers = [];
  users.forEach(function (user) {
    simpleUsers.push({ 
      username: user.username,
      ready: user.ready, 
      team: user.teamNum, 
      id:user.socket.id,
      cards: user.cards 
    });
  });
  for (let i in users) {
    i = parseInt(i);
    ordered = rotateArray(simpleUsers, ((i + 1) % simpleUsers.length));
    users[i].socket.emit('callStoreMutation', {
      mutation: 'setUsers',
      val: ordered
    });
  }
}

function awardWinner(winning, lobby) {
  sendChat(`${winning.user.username} takes it with the ${winning.card.num} of ${winning.card.suit}`)
  for (let i = 0; i < currTrick.length; i++)
    lobby.teams[winning.user.teamNum].cards.push(currTrick[i].card)
  setTimeout(function () { trickReset(winning, lobby); }, 1500);
};

function trickReset(winner, lobby) {
  // Rotate users array until winner is in 0th position
  while (users[0].socket.id != winner.user.socket.id)
    users.unshift(users.pop())
  winner.user.socket.broadcast.emit('chat', `${winner.user.username} has the lead`);
  winner.user.socket.emit('chat', 'Your lead')

  // It will get incremented by nextTrick
  currPlayerNum = -1;

  callStoreMutation('setLeadSuit', undefined)
  leadSuit = undefined;
  currTrick = [];

  io.sockets.emit('newTrick', '');
  callStoreMutation('setLeader', '')
  if (lobby.teams[0].cards.length + lobby.teams[1].cards.length == users.length * 6) {
    nextHand(lobby);
  }
  else
    nextTrick();
}

function assignPoints() {
  let biddingTeam;
  for (let i in users)
    if (users[i].socket.id == currBid.player.socket.id)
      biddingTeam = users[i].teamNum;

  if (lobby.teams[biddingTeam].points.length < currBid.amount)
    score[biddingTeam] -= currBid.amount;
  else
    score[biddingTeam] += lobby.teams[biddingTeam].points.length;
  score[(biddingTeam + 1) % 2] += lobby.teams[(biddingTeam + 1) % 2].points.length;

  // If both teams cross 11 in the same round, the bidding team wins
  if (score[biddingTeam] >= constants.scoreToWin) {
    endGame(lobby.teams[biddingTeam])
  }
  else if (score[(biddingTeam + 1) % 2] >= constants.scoreToWin) {
    endGame(lobby.teams[(biddingTeam + 1) % 2]);
  }
};

function endGame(team) {
  callStoreMutation('gameOver', team.name);
  gameOver = true;
}

function dealCards() {
  deck = deckFunctions.shuffle()
  callStoreMutation('resetDeck');
  callStoreMutation('setDealer', false);
  if (lastDealer)
    users = rotateArray(users, (users.indexOf(lastDealer) + 2) % 4)
  dealer = users[users.length - 1];
  lastDealer = dealer;
  dealer.socket.broadcast.emit('chat', `${dealer.username} is dealer`)
  dealer.socket.emit('chat', 'You are the dealer')
  dealer.socket.emit('callStoreMutation', {
    mutation: 'setDealer',
    val: true
  });

  let hand;
  for (var i = 0; i < users.length; i++) {
    hand = []
    for (var j = 0; j < 6; j++)
      hand.push(deck.pop())
    users[i].socket.emit('deal', hand)
  }

  for (let user of users)
    user.cards = 6;
  sendUpdatedUsers();

  currBid = { player: '', amount: 'pass' }
  currPlayerNum = 0;
  currPlayer = users[currPlayerNum];
  nextBidder();
}

function nextBidder() {
  let addon = '';
  if (currBid.player)
    addon = `, ${currBid.player.username} has it for ${currBid.amount}`
  currPlayer.socket.broadcast.emit('status', `Waiting for ${currPlayer.username} to choose a bid${addon}.`);
  currPlayer.socket.emit('callStoreMutation', {
    mutation: 'setCurrBid',
    val: currBid.amount
  });
  currPlayer.socket.emit('setProp', {
    prop: 'bidding',
    val: true
  });
  currPlayer.socket.emit('status', 'Your bid' + addon);
}

function recieveBid(data) {
  if (data != 'pass') {
    // Any bid that isn't pass will be greater than than the current bid
    currBid = { player: currPlayer, amount: data }
    currPlayer.socket.broadcast.emit('chat', `${currPlayer.username} bid ${data}`)
  }
  else
    currPlayer.socket.broadcast.emit('chat', `${currPlayer.username} passed`)
  currPlayer.socket.emit('setProp', {
    prop: 'bidding',
    val: false
  });
  currPlayerNum++;

  // If we've had our last bid
  if (currPlayerNum == users.length)
    setUpHand();
  else {
    currPlayer = users[currPlayerNum];
    nextBidder();
  }
}

function setUpHand() {
  // Case where dealer gets bid
  if (!currBid.player) {
    currPlayerNum = users.length - 1;
    currPlayer = users[currPlayerNum];
    currBid = { player: currPlayer.username, amount: 2 }
  }
  sendChat(`${currBid.player.username} has it for ${currBid.amount}`);
  for (var i = 0; i < users.length; i++) {
    if (users[i].socket.id == currBid.player.socket.id) {
      currPlayerNum = i;
      break;
    }
  }

  users = rotateArray(users, currPlayerNum);
  callStoreMutation('setLeadSuit', undefined)
  callStoreMutation('setTrumpSuit', '')
  trumpSuit = undefined;
  leadSuit = undefined;
  currTrick = [];
  // Compensating for the increment at start of nextTrick
  currPlayerNum = -1;
  nextTrick();
}

function printPoints(team) {
  let pointText = team.points.join(", ");
  return (pointText ? pointText : "nothing")
}

function setProp(prop, val) {
  io.sockets.emit('setProp', {
    prop, val
  });
}

function callStoreMutation(mutation, val) {
  io.sockets.emit('callStoreMutation', {
    mutation, val 
  });
}

function sendChat(msg) {
  io.sockets.emit('chat', msg);
}

function rotateArray(arr, num) {
  arr = arr.slice(num, arr.length).concat(arr.slice(0, num))
  return arr;
}

function nextTrick() {
  currPlayerNum = (currPlayerNum + 1) % users.length;
  currPlayer = users[currPlayerNum]
  currPlayer.socket.broadcast.emit('status', `Waiting for ${currPlayer.username} to make a play`)
  currPlayer.socket.emit('status', 'Waiting for you to make a play')
  currPlayer.socket.emit('setProp', {
    prop: 'currPlay',
    val: true
  });
}

function nextHand(lobby) {
  const teamPoints = gameFunctions.countPoints([lobby.teams[0].cards, lobby.teams[1].cards], trumpSuit, currBid);  
  lobby.teams[0].points = teamPoints[0];
  lobby.teams[1].points = teamPoints[1];
  assignPoints(lobby);
  sendChat(`${lobby.teams[0].name.join(" ")} won ${printPoints(lobby.teams[0])}`)
  sendChat(`${lobby.teams[1].name.join(" ")} won ${printPoints(lobby.teams[1])}`)
  setProp('score', score);
  if (!gameOver) {
    dealCards();
    lobby.teams = [{ name: lobby.teams[0].name, cards: [], points: [] }, { name: lobby.teams[1].name, cards: [], points: [] }];
  }
}