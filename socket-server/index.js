var path = require('path');
var express = require('express');
var app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http, {
  cors: {
    origin: "http://vps:8080",
    methods: ["GET", "POST"],
    credentials: true
  }
});
var port = 3000;

var gameStartCountdown;

var htmlPath = path.join(__dirname, 'public');

app.use(express.static(htmlPath));

http.listen(port, function () {
  console.log('listening on *:' + port);
});

var users = [];
var teams = [{ cards: [], points: [] }, { cards: [], points: [] }];
var score = [0, 0]
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
    console.log(users.filter(user => !user.ready).length)
    sendUpdatedUsers();
    if (count && !ready) {
      clearInterval(gameStartCountdown);
      io.sockets.emit('setProp', {
        prop: 'gameStarting',
        val: 0
      });
    }
    else if (users.filter(user => !user.ready).length == 0) {
      io.sockets.emit('setProp', {
        prop: 'gameStarting',
        val: count
      });
      gameStartCountdown = setInterval(function () {
        count--;
        io.sockets.emit('setProp', {
          prop: 'gameStarting',
          val: count
        });
        if (count == 0) {
          clearInterval(gameStartCountdown);
          io.sockets.emit('setProp', {
            prop: 'gameStage',
            val: 'playing'
          });
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
      io.sockets.emit('setProp', {
        prop: 'trumpSuit',
        val: card.suit
      });
    }
    if (!leadSuit) {
      leadSuit = card.suit
      io.sockets.emit('setProp', {
        prop: 'leadSuit',
        val: card.suit
      });
    }
    winning = evalWinner();
    io.sockets.emit('setProp', {
      prop: 'leader',
      val: winning.user.username
    });
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
    ordered = shuffleToFront(simpleUsers, ((i + 1) % simpleUsers.length));
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
}

function evalWinner() {
  let winning = currBout[0];
  let curr;
  for (let i = 0; i < currBout.length; i++) {
    curr = currBout[i]
    console.log(curr.card.suit == trumpSuit, winning.card.suit == trumpSuit)
    if (curr.card.suit == trumpSuit && winning.card.suit != trumpSuit) {
      winning = curr;
      console.log("Trumped")
    }
    else if (curr.card.suit == trumpSuit && nums.indexOf(winning.card.num) < nums.indexOf(curr.card.num)) {
      winning = curr;
      console.log("Higher trump")
    }
    else if (winning.card.suit != trumpSuit && curr.card.suit == leadSuit && nums.indexOf(winning.card.num) < nums.indexOf(curr.card.num))
      winning = curr;
  }
  return winning;
}

function boutReset(winner) {
  // Rotate users array until winner is in 0th position
  while (users[0].username != winner.user.username)
    users.unshift(users.pop())
  winner.user.socket.broadcast.emit('chat', winner.user.username + ' has the lead');
  winner.user.socket.emit('chat', 'Your lead')

  // It will get incremented by nextPlay
  currPlayerNum = -1;

  io.sockets.emit('setProp', {
    prop: 'leadSuit',
    val: undefined
  });
  leadSuit = undefined;
  currBout = [];

  io.sockets.emit('newBout', '');
  io.sockets.emit('setProp', {
    prop: 'leader',
    val: ''
  });

  if (teams[0].cards.length + teams[1].cards.length == users.length * 6)
    countPoints();
  else
    nextPlay();
}

function countPoints() {
  let game = [0, 0]
  let high = { team: undefined, index: -1 };
  let low = { team: undefined, index: 14 };
  let curr;
  let pointsMap = [10, 1, 2, 3, 4];

  for (let i = 0; i < 2; i++)
    for (let j = 0; j < teams[i].cards.length; j++) {
      curr = teams[i].cards[j];
      if (curr.suit == trumpSuit) {
        if (curr.num == 'Jack')
          teams[1].points.push('Jack');
        if (nums.indexOf(curr.num) < low.index) {
          low.team = teams[i].points
          low.index = nums.indexOf(curr.num)
        }
        if (nums.indexOf(curr.num) > high.index) {
          high.team = teams[i].points
          high.index = nums.indexOf(curr.num)
        }
      }
      if (nums.indexOf(curr.num) > 7)
        game[i] += pointsMap[nums.indexOf(curr.num) - 8]
    }
  if (game[0] > game[1])
    teams[0].points.push('Game');
  else if (game[0] < game[1])
    teams[1].points.push('Game');
  high.team.push('High');
  low.team.push('Low');

  assignPoints();

  teams = [{ cards: [], points: [] }, { cards: [], points: [] }];

  dealCards();
}

function assignPoints() {
  let currTeam;
  for (let i in users) {
    if (users[i].username == currBid.player) {
      currTeam = users[i].teamNum;
    }
  }
  console.log(teams[0].points)
  console.log(teams[1].points)
  if (teams[currTeam].points.length < currBid.amount)
    score[currTeam] -= currBid.amount;
  else
    score[currTeam] += teams[currTeam].points.length;
  score[(currTeam + 1) % 2] += teams[(currTeam + 1) % 2].points.length;

  io.sockets.emit('setProp', {
    prop: 'score',
    val: score
  });
}

// Placeholder, triggered by deal button
function dealCards() {
  deck = shuffle()
  shuffle()

  dealer = users[users.length - 1]
  dealer.socket.broadcast.emit('chat', dealer.username + ' is dealer')
  dealer.socket.emit('chat', 'You are the dealer')
  dealer.socket.emit('setProp', {
    prop: 'dealer',
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
  currPlayer.socket.emit('status', 'Your bid', currBid);
  currPlayer.socket.broadcast.emit('status', 'Waiting for ' + currPlayer.username + ' to choose a bid');
  currPlayer.socket.emit('status', 'Your bid');
}

function recieveBid(data) {
  if (data != 'pass') {
    currBid = { player: currPlayer.username, amount: data }
    currPlayer.socket.broadcast.emit('chat', currPlayer.username + ' bid ' + data)
  }
  else
    currPlayer.socket.broadcast.emit('chat', currPlayer.username + ' passed')

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

  users = shuffleToFront(users, currPlayerNum);
  io.sockets.emit('setProp', {
    prop: 'leadSuit',
    val: undefined
  });
  io.sockets.emit('setProp', {
    prop: 'trumpSuit',
    val: undefined
  });
  trumpSuit = undefined;
  leadSuit = undefined;
  currBout = [];
  // Compensating for the increment at start of nextPlay
  currPlayerNum = -1;
  nextPlay();
}

function shuffleToFront(arr, num) {
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

var masterDeck = []

var nums = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'Jack', 'Queen', 'King', 'Ace']
var suits = ['Spades', 'Clubs', 'Hearts', 'Diamonds']

createDeck()

function createDeck() {
  for (let i = 0; i < nums.length; i++)
    for (let j = 0; j < suits.length; j++)
      masterDeck.push({ num: nums[i], suit: suits[j] })
}

function shuffle() {
  let newMaster = Array.from(masterDeck)
  let newDeck = []

  for (let i = 0; i < 52; i++)
    newDeck.push(0)

  let newPos
  while (newMaster.length) {
    newPos = parseInt(Math.random() * 52)
    while (newDeck[newPos] != 0)
      newPos = (newPos + 1) % 52
    newDeck[newPos] = newMaster.pop()
  }
  return newDeck
}
