// Get our dependencies
var express = require('express');
var socket = require('socket.io');

var app = express();

var port = 3000;

var server = app.listen(port, function() {
  console.log('Listening at http://localhost: ' + port);
});

app.use(express.static('public'));

var sock = socket(server);

var users = [];
var curr_player_num, curr_bid, curr_player, trump_suit, lead_suit, curr_bout;

sock.on('connection', function(socket) {
  console.log('made connection with socket ' + socket.id);
  // when the server receives a chat event
  socket.on('chat', function(data) {
    sock.sockets.emit('chat', data);
  });

  socket.on('ready_signal',deal_cards);
  socket.on('bid',recieve_bid);

  socket.on('username_submission',function(data) {
    users.push({username:data['username_submission'],socket:socket});
    socket.broadcast.emit('chat',data['username_submission'] + ' has joined')
  });

  socket.on('play',function(card){
    curr_player.socket.broadcast.emit('chat',curr_player.username + ' played ' + card)
    if (!trump_suit) {
      trump_suit = card.split(' ')[2]
      sock.sockets.emit('set_prop','trump_suit',card.split(' ')[2])
    }
    if (!lead_suit) {
      lead_suit = card.split(' ')[2]
      sock.sockets.emit('set_prop','lead_suit',card.split(' ')[2])
    }
    curr_bout.push(card);
    next_play();
  })
});

// Placeholder, triggered by deal button
function deal_cards(){
  deck = shuffle()
  shuffle()

  dealer = users[users.length-1]
  dealer.socket.broadcast.emit('chat',dealer.username + ' is dealer')
  dealer.socket.emit('chat','You are the dealer')
  dealer.socket.emit('set_prop','dealer',true)

  let hand;
  for (var i = 0; i < users.length; i++) {
    hand = []
    for (var j = 0; j < 6; j++)
        hand.push(deck.pop())
    users[i].socket.emit('set_prop','hand',hand)
  }

  curr_bid = {player:'',amount:''}
  curr_player_num = 0;
  curr_player = users[curr_player_num];

  next_bidder();
}

function next_bidder() {
  curr_player.socket.emit('status',{status:'bid',bid:curr_bid});
  curr_player.socket.broadcast.emit('status',
    {status:'waiting',info:{player:curr_player.username,action:' to choose a bid'}});
}

function recieve_bid(data) {
  if (data != 'pass') {
    curr_bid = {player:curr_player.username,amount:data}
    curr_player.socket.broadcast.emit('chat',curr_player.username + ' bid ' + data)
  }
  else
    curr_player.socket.broadcast.emit('chat',curr_player.username + ' passed')

  curr_player_num++;

  // If we've had our last bid
  if (curr_player_num == users.length)
    set_up_hand();
  else {
    curr_player = users[curr_player_num];
    next_bidder();
  }
}

function set_up_hand(){
  sock.sockets.emit('chat',curr_bid.player + ' has it for ' + curr_bid.amount);
  
  for (var i = 0; i < users.length; i++)
    if (users[i].username == curr_bid.player.username)
      curr_player_num = i;
  
  // It will get incremented by next_play
  curr_player_num--;

  sock.sockets.emit('set_prop','lead_suit',undefined);
  sock.sockets.emit('set_prop','trump_suit',undefined);
  trump_suit = undefined;
  lead_suit = undefined;
  curr_bout = [];

  next_play();
}

function next_play(){
  curr_player_num = (curr_player_num + 1) % users.length;
  curr_player = users[curr_player_num]
  curr_player.socket.broadcast.emit('status',{status:'waiting',info:{player:curr_player.username,action:' to make a play'}})
  curr_player.socket.emit('set_prop','curr_play',true)
}

var master_deck = []

var nums = []
var suits = ['Spades','Clubs','Hearts','Diamonds']
var suit_symbols = {spades:'♠',clubs:'♣',hearts:'♥',diamonds:'♦'}

var faces = ['Jack','Queen','King','Ace']

create_deck()

function create_deck() {
    for (let i = 2; i < 11; i++)
        nums.push(i)

    for (let i = 0; i < faces.length; i++)
        nums.push(faces[i])

    for (let i = 0; i < nums.length; i++)
        for (let j = 0; j < suits.length; j++)
            master_deck.push(nums[i] + ' of ' + suits[j])
}

function shuffle(){
    let new_master = Array.from(master_deck)
    let new_deck = []

    for (let i = 0; i < 52; i++)
        new_deck.push(0)

    let new_pos
    while (new_master.length) {
        new_pos = parseInt(Math.random()*52)
        while (new_deck[new_pos] != 0) 
            new_pos = (new_pos + 1) % 52
        new_deck[new_pos] = new_master.pop()
    }
    return new_deck
}