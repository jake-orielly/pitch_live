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

app.use(express.static(htmlPath));

http.listen(port, function () {
  console.log('listening on *:' + port);
});

var users = [];
var teams = [{ cards: [], points: [] }, { cards: [], points: [] }];
var score = [0, 0];
var currPlayerNum, currBid, currPlayer, trumpSuit, leadSuit, currBout;

io.on('connection', function (socket) {
  socket.on('chat', function (msg) {
    io.emit('chat', msg);
  });
  socket.on('bid', recieveBid);

  socket.on('usernameSubmission', function (data) {
    users.push({ username: data['usernameSubmission'], ready: false, socket: socket });
    users[users.length - 1].team = teams[users.length % 2].cards;
    users[users.length - 1].teamNum = users.length % 2;
    socket.broadcast.emit('chat', data['usernameSubmission'] + ' has joined');
    sendUpdatedUsers();
  });

  socket.on('disconnect', function () {
    let pos;
    for (let i = 0; i < users.length; i++)
      if (users[i].socket.id == socket.id)
        pos = i;
    if (users[pos]) {
      io.emit('chat', users[pos].username + ' has left');
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
    else if (users.filter(user => !user.ready).length == 0) {
      setProp('gameStarting', count);
      gameStartCountdown = setInterval(function () {
        count--;
        setProp('gameStarting', count);
        if (count == 0) {
          clearInterval(gameStartCountdown);
          setProp('gameStage', 'playing')
          setTimeout(dealCards, 500);
        }
      }, 1000);
    }
  });

  socket.on('play', function (card) {
    let winning;
    io.sockets.emit('chat', currPlayer.username + ' played the ' + card.num + ' of ' + card.suit)
    socket.broadcast.emit('played', { card: card, user: currPlayer.username });
    currBout.push({ user: currPlayer, card: card });
    if (!trumpSuit) {
      trumpSuit = card.suit
      callStoreMutation('setTrumpSuit', card.suit)
    }
    if (!leadSuit) {
      leadSuit = card.suit
      callStoreMutation('setLeadSuit', card.suit)
    };
    winning = gameFunctions.evalWinner(currBout, trumpSuit, leadSuit);
    callStoreMutation('setLeader', winning.user.username)
    if (currPlayerNum == users.length - 1) {
      awardWinner(winning);
    }
    else
      nextPlay();
  })
});

function sendUpdatedUsers() {
  let simpleUsers = [];
  users.forEach(function (user) {
    simpleUsers.push({ username: user.username, ready: user.ready, team: user.teamNum });
  });
  for (let i in users) {
    i = parseInt(i);
    ordered = rotateArray(simpleUsers, ((i + 1) % simpleUsers.length));
    users[i].socket.emit('setProp', {
      prop: 'users',
      val: JSON.stringify(ordered),
      isJson: true
    });
  }
}

function awardWinner(winning) {
  io.sockets.emit('chat', winning.user.username + ' takes it with the ' + winning.card.num + ' of ' + winning.card.suit)
  for (let i = 0; i < currBout.length; i++)
    winning.user.team.push(currBout[i].card)
  setTimeout(function () { boutReset(winning); }, 1500);
};

function boutReset(winner) {
  // Rotate users array until winner is in 0th position
  while (users[0].username != winner.user.username)
    users.unshift(users.pop())
  winner.user.socket.broadcast.emit('chat', winner.user.username + ' has the lead');
  winner.user.socket.emit('chat', 'Your lead')

  // It will get incremented by nextPlay
  currPlayerNum = -1;

  callStoreMutation('setLeadSuit', undefined)
  leadSuit = undefined;
  currBout = [];

  io.sockets.emit('newBout', '');
  callStoreMutation('setLeader', '')

  if (teams[0].cards.length + teams[1].cards.length == users.length * 6) {
    teams = gameFunctions.countPoints(teams, trumpSuit);
    assignPoints()
    setProp('score', score)
    dealCards();
    teams = [{ cards: [], points: [] }, { cards: [], points: [] }];
  }
  else
    nextPlay();
}

function assignPoints() {
  let biddingTeam;
  for (let i in users)
    if (users[i].username == currBid.player)
      biddingTeam = users[i].teamNum;

  if (teams[biddingTeam].points.length < currBid.amount)
    score[biddingTeam] -= currBid.amount;
  else
    score[biddingTeam] += teams[biddingTeam].points.length;
  score[(biddingTeam + 1) % 2] += teams[(biddingTeam + 1) % 2].points.length;
};

function dealCards() {
  deck = deckFunctions.shuffle()

  callStoreMutation('setDealer', false);
  dealer = users[users.length - 1]
  dealer.socket.broadcast.emit('chat', dealer.username + ' is dealer')
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

  currBid = { player: '', amount: 'pass' }
  currPlayerNum = 0;
  currPlayer = users[currPlayerNum];
  nextBidder();
}

function nextBidder() {
  let addon = ''
  if (currBid.player)
    addon = `, ${currBid.player} has it for ${currBid.amount}`
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
    currBid = { player: currPlayer.username, amount: data }
    currPlayer.socket.broadcast.emit('chat', currPlayer.username + ' bid ' + data)
  }
  else
    currPlayer.socket.broadcast.emit('chat', currPlayer.username + ' passed')
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
  io.sockets.emit('chat', currBid.player + ' has it for ' + currBid.amount);
  for (var i = 0; i < users.length; i++) {
    if (users[i].username == currBid.player)
      currPlayerNum = i;
  }

  users = rotateArray(users, currPlayerNum);
  callStoreMutation('setLeadSuit', undefined)
  callStoreMutation('setTrumpSuit', '')
  trumpSuit = undefined;
  leadSuit = undefined;
  currBout = [];
  // Compensating for the increment at start of nextPlay
  currPlayerNum = -1;
  nextPlay();
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

function rotateArray(arr, num) {
  arr = arr.slice(num, arr.length).concat(arr.slice(0, num))
  return arr;
}

function nextPlay() {
  currPlayerNum = (currPlayerNum + 1) % users.length;
  currPlayer = users[currPlayerNum]
  currPlayer.socket.broadcast.emit('status', 'Waiting for ' + currPlayer.username + ' to make a play')
  currPlayer.socket.emit('status', 'Waiting for you to make a play')
  currPlayer.socket.emit('setProp', {
    prop: 'currPlay',
    val: true
  });
}