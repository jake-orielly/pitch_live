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

const htmlPath = path.join(__dirname, 'public');

const Lobby = require('./lobby_class.js')

app.use(express.static(htmlPath));
http.listen(port, function () {
  console.log('listening on *:' + port);
});

var lobbies = [];

io.on('connection', function (socket) {
  socket.on('createLobby', function () {
    let lobby = new Lobby(io);
    lobbies.push(lobby);
    joinLobby(socket, lobby);
  })

  socket.on('joinLobby', function (id) {
    let lobby = lobbies.filter(
      l => l.id == id
    )[0];
    if (!lobby)
      socket.emit('joinFailed');
    else {
      joinLobby(socket, lobby);
    }
  });

  socket.on('usernameSubmission', function (data) {
    let lobby = socket.lobby;
    let newUser = {
      username: data['usernameSubmission'],
      ready: false,
      socket: socket,
      teamNum: lobby.getUsers().length % 2,
      cards: 0
    };
    let options;
    let partOfSpeech;
    lobby.addUser(newUser);
    for (let user of lobby.getUsers())
      user.socket.emit('chat', `${data['usernameSubmission']} has joined`);
    partOfSpeech = (parseInt((lobby.getUsers().length - 1) / 2) == 1 ? "nouns" : "adjectives");
    teammatePartOfSpeech = (partOfSpeech == "nouns" ? "adjectives" : "nouns");
    options = lobby.getTeamWords((lobby.getUsers().length - 1) % 2, partOfSpeech);
    socket.emit('callStoreMutation', {
      mutation: 'setTeamWordOptions',
      val: {
        partOfSpeech,
        options
      }
    });
    callStoreMutation(
      'setTeamNames',
      [lobby.getTeams(0).name, lobby.getTeams(1).name],
      lobby
    );
    lobby.sendUpdatedUsers();
  });

  socket.on('disconnect', function () {
    if (!socket.lobby)
      return;
    removeUser(socket);
    if (socket.lobby.getUsers().length == 0)
      lobbies.splice(lobbies.indexOf(socket.lobby));
  });

  socket.on('userLeft', () => {
    removeUser(socket)
  });

  socket.on('ready', function (ready) {
    //let count = 5;
    let count = 1;
    let lobby = socket.lobby;
    const users = socket.lobby.getUsers();
    users.filter(user => user.socket == socket)[0].ready = ready;
    socket.lobby.sendUpdatedUsers();
    if (count && !ready) {
      clearInterval(socket.lobby.getGameStartCountdown);
      setProp('gameStarting', 0, lobby);
    }
    else if (users.filter(user => !user.ready).length == 0 && users.length == 4) {
      setProp('gameStarting', count, lobby);
      socket.lobby.gameStartCountdown = setInterval(function () {
        count--;
        setProp('gameStarting', count, lobby);
        if (count == 0) {
          clearInterval(socket.lobby.gameStartCountdown);
          callStoreMutation(
            'setTeamNames',
            [
              socket.lobby.getTeams(0).name,
              socket.lobby.getTeams(1).name
            ],
            lobby
          );
          setProp('gameStage', 'playing', lobby)
          setTimeout(() => {
            socket.lobby.dealCards()
          }, 500);
        }
      }, 1000);
    }
  });

  socket.on('play', function (card) {
    let currPlayer = socket.lobby.getCurrPlayer();
    sendChat(
      `${currPlayer.username} played the ${card.num} of ${card.suit}`,
      socket.lobby
    );
    socket.lobby.sendUpdatedUsers();
    for (let user of socket.lobby.getUsers())
      user.socket.emit('played', { card: card, id: currPlayer.socket.id });
    socket.lobby.playCard(card);
  });

  socket.on('selectTeamWord', function (data) {
    socket.lobby.setTeamWord(data);
  });
});

function joinLobby(socket, lobby) {
  socket.lobby = lobby;
  socket.on('bid', (data) => {
    socket.lobby.recieveBid(data)
  });
  socket.on('chat', function (msg) {
    for (let user of socket.lobby.getUsers())
      user.socket.emit('chat', msg);
  });
  socket.emit('joinSucceeded');
  socket.emit('callStoreMutation', {
    mutation: 'setLobbyId',
    val: lobby.id
  });
}

function removeUser(socket) {
  let pos;
  if (!socket.lobby)
    return;
  for (let i = 0; i < socket.lobby.getUsers().length; i++)
    if (socket.lobby.getUser(i).socket.id == socket.id)
      pos = i;
  if (socket.lobby.getUser(pos)) {
    for (let user of socket.lobby.getUsers())
      user.socket.emit('chat', `${socket.lobby.getUser(pos).username} has left`);
    socket.lobby.removeUser(pos);
    socket.lobby.sendUpdatedUsers();
  }
}

function setProp(prop, val, lobby) {
  for (let user of lobby.getUsers())
    user.socket.emit('setProp', {
      prop, val
    });
}

function callStoreMutation(mutation, val, lobby) {
  for (let user of lobby.getUsers())
    user.socket.emit('callStoreMutation', {
      mutation, val
    });
}

function sendChat(msg, lobby) {
  for (let user of lobby.getUsers())
    user.socket.emit('chat', msg);
}