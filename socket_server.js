// Get our dependencies
var express = require("express");
var socket = require("socket.io");

var app = express();

var port = 3000;

var server = app.listen(port, function() {
  console.log("Listening at http://localhost: " + port);
});

app.use(express.static("public"));

var sock = socket(server);

var users = [];

sock.on("connection", function(socket) {
  console.log("made connection with socket " + socket.id);
  // when the server receives a chat event
  socket.on("chat", function(data) {
    // use emit to send the “chat” event to everybody that is connected, including the sender
    sock.sockets.emit("chat", data);
  });

  socket.on("ready_signal",function(data) {
    deck = shuffle()
    shuffle()
    let hand;
    for (var i = 0; i < users.length; i++) {
      hand = []
      for (var j = 0; j < 6; j++)
          hand.push(deck.pop())
      users[i].socket.emit("deal",hand)
    }
  });

  socket.on("username_submission",function(data) {
    users.push({username:data['username_submission'],socket:socket});
    socket.broadcast.emit("chat",{username:data['username_submission'],message:'has joined',status_message:true})
  });
});

var master_deck = []

var nums = []
var suits = ["Spades","Clubs","Hearts","Diamonds"]

var faces = ["Jack","Queen","King","Ace"]

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