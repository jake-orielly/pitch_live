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
var curr_player_num;
var curr_bid, curr_player;
var trump_suit, lead_suit;

sock.on('connection', function(socket) {
  console.log('made connection with socket ' + socket.id);
  // when the server receives a chat event
  socket.on('chat', function(data) {
    // use emit to send the “chat” event to everybody that is connected, including the sender
    sock.sockets.emit('chat', data);
  });

  socket.on('ready_signal',function(data) {
    deck = shuffle()
    shuffle()
  
    dealer = users[0]
    socket.broadcast.emit('chat',dealer.username + ' is dealer')
    socket.emit('chat','You are the dealer')
    socket.emit('dealer_assign')

    let hand;
    for (var i = 0; i < users.length; i++) {
      hand = []
      for (var j = 0; j < 6; j++)
          hand.push(deck.pop())
      users[i].socket.emit('deal',hand)
    }

    curr_bid = {player:'',amount:''}

    // Will be incremented by next bidder
    curr_player_num = 0;
    next_bidder();
  });

  socket.on('username_submission',function(data) {
    users.push({username:data['username_submission'],socket:socket});
    socket.broadcast.emit('chat',data['username_submission'] + ' has joined')
  });

  socket.on('bid',function(data) {
    if (data != 'pass') {
      curr_bid = {player:curr_player.username,amount:data}
      curr_player.socket.broadcast.emit('chat',curr_player.username + ' bid ' + data)
    }
    else
      curr_player.socket.broadcast.emit('chat',curr_player.username + ' passed')
    if (curr_player_num < users.length-1)
      next_bidder();
    else {
      curr_player_num = -1;
      next_bidder();
    }
  })

  socket.on('dealer_bid',function(data) {
    sock.sockets.emit('chat',curr_bid.player + ' has it for ' + curr_bid.amount);
    
    for (var i = 0; i < users.length; i++)
      if (users[i].username == curr_bid.player.username)
        curr_player_num = i;
    next_play();
  })

  socket.on('play',function(card){
    curr_player.socket.broadcast.emit('chat',curr_player.username + ' played ' + card)
  })
});

function next_play(){
  curr_player = users[curr_player_num]
  curr_player.socket.broadcast.emit('status',{status:'waiting',info:{player:curr_player.username,action:' to make a play'}})
  curr_player.socket.emit('curr_play',true)
}

function next_bidder() {
  curr_player_num++;
  curr_player = users[curr_player_num]
  curr_player.socket.emit('status',{status:'bid',bid:curr_bid});
  curr_player.socket.broadcast.emit('status',
    {status:'waiting',info:{player:curr_player.username,action:' to choose a bid'}});
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