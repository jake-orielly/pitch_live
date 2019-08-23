var path = require('path');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = 3000;

var htmlPath = path.join(__dirname, 'public');

app.use(express.static(htmlPath));

http.listen(port, function(){
  console.log('listening on *:' + port);
}); 

var users = [];
var teams = [{cards:[],points:[]},{cards:[],points:[]}];
var score = [0,0]
var curr_player_num, curr_bid, curr_player, trump_suit, lead_suit, curr_bout;

io.on('connection', function(socket){
  socket.on('chat', function(msg){
    io.emit('chat', msg);
  });

  socket.on('ready_signal',deal_cards);
  socket.on('bid',recieve_bid);

  socket.on('username_submission',function(data) {
    users.push({username:data['username_submission'],socket:socket});
    users[users.length-1].team = teams[users.length%2].cards
    socket.broadcast.emit('chat',data['username_submission'] + ' has joined')
  });

  socket.on('disconnect', function() {
      let pos = users.indexOf(socket);
      io.emit('chat',users[pos].username + ' has left');
      users.splice(pos, 1);
  });

  socket.on('play',function(card){
    io.sockets.emit('chat',curr_player.username + ' played the ' + card.num + ' of ' + card.suit)
    if (!trump_suit) {
      trump_suit = card.suit
      io.sockets.emit('set_prop','trump_suit',card.suit)
    }
    if (!lead_suit) {
      lead_suit = card.suit
      io.sockets.emit('set_prop','lead_suit',card.suit)
    }
    curr_bout.push({user:curr_player,card:card});
    if (curr_player_num == users.length-1)
      eval_winner();
    else
      next_play();
  })
});

function eval_winner(){
  let winning = curr_bout[0];
  let curr;
  for (let i = 0; i < curr_bout.length; i++)
    curr = curr_bout[i]
    if (((winning.card.suit == trump_suit && curr.card.suit == trump_suit) || (curr.card.suit == lead_suit)) 
    && nums.indexOf(winning.card.num) < nums.indexOf(curr.card.num))
      winning = curr;

  io.sockets.emit('chat',winning.user.username + ' takes it with the ' + winning.card.num + ' of ' + winning.card.suit)
  for (let i = 0; i < curr_bout.length; i++)
    winning.user.team.push(curr_bout[i].card)
  bout_reset(winning);
}

function bout_reset(winner) {
  // Rotate users array until winner is in 0th position
  while (users[0].username != winner.user.username)
    users.unshift(users.pop())
  winner.user.socket.broadcast.emit('chat',winner.user.username + ' has the lead');
  winner.user.socket.emit('chat','Your lead')

  // It will get incremented by next_play
  curr_player_num = -1;

  io.sockets.emit('set_prop','lead_suit',undefined);
  lead_suit = undefined;
  curr_bout = [];

  if (teams[0].cards.length + teams[1].cards.length == users.length * 6)
    count_points();
  else
    next_play();
}

function count_points(){
  let game = [0,0]
  let high = {team:undefined,index:-1};
  let low = {team:undefined,index:14};
  let curr;
  let points_map = [10,1,2,3,4]

  for (let i = 0; i < 2; i++)
    for (let j = 0; j < teams[i].cards.length; j++) {
      curr = teams[i].cards[j];
      if (curr.suit == trump_suit) {
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
        game[i] += points_map[nums.indexOf(curr.num) - 8]
    }
  if (game[0] > game[1])
    teams[0].points.push('Game');
  else if (game[0] < game[1])
    teams[1].points.push('Game');
  high.team.push('High')
  low.team.push('Low')
  console.log(teams)
  score[0] += teams[0].points.length;
  score[1] += teams[1].points.length;

  io.sockets.emit('set_prop','score',score);

  teams = [{cards:[],points:[]},{cards:[],points:[]}];
  deal_cards();
}

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
    users[i].socket.emit('deal',hand)
  }

  curr_bid = {player:'',amount:''}
  curr_player_num = 0;
  curr_player = users[curr_player_num];

  next_bidder();
}

function next_bidder() {
  curr_player.socket.emit('status','Your bid',curr_bid);
  curr_player.socket.broadcast.emit('status', 'Waiting for ' + curr_player.username + ' to choose a bid');
  curr_player.socket.emit('status','Your bid');
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
  io.sockets.emit('chat',curr_bid.player + ' has it for ' + curr_bid.amount);
  
  for (var i = 0; i < users.length; i++)
    if (users[i].username == curr_bid.player.username)
      curr_player_num = i;
  
  // It will get incremented by next_play
  curr_player_num--;

  io.sockets.emit('set_prop','lead_suit',undefined);
  io.sockets.emit('set_prop','trump_suit',undefined);
  trump_suit = undefined;
  lead_suit = undefined;
  curr_bout = [];

  next_play();
}

function next_play(){
  curr_player_num = (curr_player_num + 1) % users.length;
  curr_player = users[curr_player_num]
  curr_player.socket.broadcast.emit('status','Waiting for ' + curr_player.username + ' to make a play')
  curr_player.socket.emit('set_prop','curr_play',true)
}

var master_deck = []

var nums = [2,3,4,5,6,7,8,9,10,'Jack','Queen','King','Ace']
var suits = ['Spades','Clubs','Hearts','Diamonds']

create_deck()

function create_deck() {
    for (let i = 0; i < nums.length; i++)
        for (let j = 0; j < suits.length; j++)
            master_deck.push({num:nums[i],suit:suits[j]})
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