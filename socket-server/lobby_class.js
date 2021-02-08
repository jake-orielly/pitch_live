const constants = require('./constants.js');
const deckFunctions = require('./deck_functions.js');
const teamNameWords = require('./team_name_words.js');
const gameFunctions = require('./game_functions.js');

class Lobby {
    constructor(io) {
        this.io = io;
        this.id = this.makeid(4);
        this.users = [];
        this.teams = [{ name: [], cards: [], points: [] }, { name: [], cards: [], points: [] }];
        this.teamWords = this.generateTeamWords();
        this.score = [0, 0];
        this.gameStartCountdown = 0;
        this.gameOver = false;
        this.currPlayerNum = undefined;
        this.currPlayer = undefined;
        this.trumpSuit = undefined;
        this.leadSuit = undefined;
        this.currBid = undefined;
        this.currTrick = undefined;
        this.lastDealer = undefined;
    }

    sendUpdatedUsers() {
        let simpleUsers = [];
        let ordered;
        this.users.forEach(function (user) {
            simpleUsers.push({
                username: user.username,
                ready: user.ready,
                team: user.teamNum,
                id: user.socket.id,
                cards: user.cards
            });
        });
        for (let i in this.users) {
            i = parseInt(i);
            ordered = this.rotateArray(simpleUsers, ((i + 1) % simpleUsers.length));
            this.users[i].socket.emit('callStoreMutation', {
                mutation: 'setUsers',
                val: ordered
            });
        }
    }

    generateTeamWords() {
        let adjectives = teamNameWords.adjectives.slice();
        let nouns = teamNameWords.nouns.slice();
        const numOptions = 3;

        this.shuffleArray(adjectives);
        this.shuffleArray(nouns);

        const team0Adjectives = adjectives.slice(0, numOptions);
        const team0Nouns = nouns.slice(0, numOptions);
        const team1Adjectives = adjectives.slice(numOptions, numOptions * 2);
        const team1Nouns = nouns.slice(numOptions, numOptions * 2);

        // Default values in case users don't make a selection
        this.teams[0].name = [team0Adjectives[0], team0Nouns[0]];
        this.teams[1].name = [team1Adjectives[0], team1Nouns[0]];
        return [
            { adjectives: team0Adjectives, nouns: team0Nouns },
            { adjectives: team1Adjectives, nouns: team1Nouns }
        ]
    };

    playCard(card) {
        let winning;
        this.currTrick.push({ user: this.currPlayer, card });
        this.currPlayer.cards--;
        if (!this.trumpSuit) {
            this.trumpSuit = card.suit
            this.callStoreMutation('setTrumpSuit', card.suit)
        }
        if (!this.leadSuit) {
            this.leadSuit = card.suit
            this.callStoreMutation('setLeadSuit', card.suit)
        };
        winning = gameFunctions.evalWinner(this.currTrick, this.trumpSuit, this.leadSuit);
        this.callStoreMutation('setLeader', winning.user.username)
        if (this.currPlayerNum == this.users.length - 1) {
            this.awardWinner(winning);
        }
        else
            this.nextTrick();
    }

    nextTrick() {
        this.currPlayerNum = (this.currPlayerNum + 1) % this.users.length;
        this.currPlayer = this.users[this.currPlayerNum];
        this.broadcastToLobby('status', `Waiting for ${this.currPlayer.username} to make a play`);
        this.currPlayer.socket.emit('status', 'Waiting for you to make a play')
        this.currPlayer.socket.emit('setProp', {
            prop: 'currPlay',
            val: true
        });
    }

    setTeamWord(data) {
        let position = (data.partOfSpeech == 'adjectives' ? 0 : 1);
        this.teams[data.teamNum].name[position] = data.val;
        this.callStoreMutation('setTeamNames', [
            this.teams[0].name,
            this.teams[1].name
        ]);
    }

    awardWinner(winning) {
        for (let user of this.getUsers())
            user.socket.emit('chat', `${winning.user.username} takes it with the ${winning.card.num} of ${winning.card.suit}`);
        for (let i = 0; i < this.currTrick.length; i++)
            this.teams[winning.user.teamNum].cards.push(this.currTrick[i].card)
        setTimeout(() => { this.trickReset(winning); }, 1500);
    };

    trickReset(winner) {
        // Rotate users array until winner is in 0th position
        while (this.users[0].socket.id != winner.user.socket.id)
            this.users.unshift(this.users.pop())
        this.broadcastToLobby('chat', `${winner.user.username} has the lead`);
        winner.user.socket.emit('chat', 'Your lead')

        // It will get incremented by nextTrick
        this.currPlayerNum = -1;

        this.callStoreMutation('setLeadSuit', undefined)
        this.leadSuit = undefined;
        this.currTrick = [];

        for (let user of this.getUsers())
            user.socket.emit('newTrick', '');
        this.callStoreMutation('setLeader', '')
        if (this.teams[0].cards.length + this.teams[1].cards.length == this.users.length * 6) {
            this.nextHand();
        }
        else
            this.nextTrick();
    }

    assignPoints() {
        let biddingTeam;
        for (let i in this.users)
            if (this.users[i].socket.id == this.currBid.player.socket.id)
                biddingTeam = this.users[i].teamNum;

        if (this.teams[biddingTeam].points.length < this.currBid.amount)
            this.score[biddingTeam] -= this.currBid.amount;
        else
            this.score[biddingTeam] += this.teams[biddingTeam].points.length;
        this.score[(biddingTeam + 1) % 2] += this.teams[(biddingTeam + 1) % 2].points.length;

        // If both teams cross 11 in the same round, the bidding team wins
        if (this.score[biddingTeam] >= constants.scoreToWin) {
            this.endGame(this.teams[biddingTeam])
        }
        else if (this.score[(biddingTeam + 1) % 2] >= constants.scoreToWin) {
            this.endGame(this.teams[(biddingTeam + 1) % 2]);
        }
    }

    endGame(team) {
        this.callStoreMutation('gameOver', team.name);
        this.gameOver = true;
        for (let user of this.getUsers())
            user.ready = false;
        this.sendUpdatedUsers();
        this.teamWords = this.generateTeamWords();
        this.score = [0, 0];
    }

    dealCards() {
        let deck;
        deck = deckFunctions.shuffle();
        this.callStoreMutation('resetDeck');
        this.callStoreMutation('setDealer', false);
        if (this.lastDealer)
            this.users = this.rotateArray(this.users, (this.users.indexOf(this.lastDealer) + 2) % 4);
        this.dealer = this.users[this.users.length - 1];
        this.lastDealer = this.dealer;
        this.broadcastToLobby('chat', `${this.dealer.username} is dealer`);
        this.dealer.socket.emit('chat', 'You are the dealer.')
        this.dealer.socket.emit('callStoreMutation', {
            mutation: 'setDealer',
            val: true
        });

        let hand;
        for (var i = 0; i < this.users.length; i++) {
            hand = []
            for (var j = 0; j < 6; j++)
                hand.push(deck.pop())
            this.users[i].socket.emit('deal', hand)
        };

        this.currBid = { player: '', amount: 'pass' }
        this.currPlayerNum = 0;
        this.currPlayer = this.users[this.currPlayerNum];

        for (let user of this.users)
            user.cards = 6;
        this.sendUpdatedUsers();

        this.nextBidder();
    }

    nextBidder() {
        let addon = '';
        if (this.currBid.player)
            addon = `, ${this.currBid.player.username} has it for ${this.currBid.amount}`
        this.broadcastToLobby('status', `Waiting for ${this.currPlayer.username} to choose a bid${addon}.`);

        this.currPlayer.socket.emit('callStoreMutation', {
            mutation: 'setCurrBid',
            val: this.currBid.amount
        });
        this.currPlayer.socket.emit('setProp', {
            prop: 'bidding',
            val: true
        });
        this.currPlayer.socket.emit('status', 'Your bid' + addon);
    }

    recieveBid(data) {
        if (data != 'pass') {
            // Any bid that isn't pass will be greater than than the current bid
            this.currBid = { player: this.currPlayer, amount: data }
            this.broadcastToLobby('chat', `${this.currPlayer.username} bid ${data}`);
        }
        else
            this.broadcastToLobby('chat', `${this.currPlayer.username} passed`);
        this.currPlayer.socket.emit('setProp', {
            prop: 'bidding',
            val: false
        });
        this.currPlayerNum++;

        // If we've had our last bid
        if (this.currPlayerNum == this.users.length)
            this.setUpHand();
        else {
            this.currPlayer = this.users[this.currPlayerNum];
            this.nextBidder();
        }
    }

    setUpHand() {
        // Case where dealer gets bid
        if (!this.currBid.player) {
            this.currPlayerNum = this.users.length - 1;
            this.currPlayer = this.users[this.currPlayerNum];
            this.currBid = { player: this.currPlayer.username, amount: 2 }
        }
        for (let user of this.getUsers())
            user.socket.emit('chat', `${this.currBid.player.username} has it for ${this.currBid.amount}`);
        for (var i = 0; i < this.users.length; i++) {
            if (this.users[i].socket.id == this.currBid.player.socket.id) {
                this.currPlayerNum = i;
                break;
            }
        }

        this.users = this.rotateArray(this.users, this.currPlayerNum);
        this.callStoreMutation('setLeadSuit', undefined)
        this.callStoreMutation('setTrumpSuit', '')
        this.trumpSuit = undefined;
        this.leadSuit = undefined;
        this.currTrick = [];
        // Compensating for the increment at start of nextTrick
        this.currPlayerNum = -1;
        this.nextTrick();
    }

    nextHand() {
        const teamPoints = gameFunctions.countPoints([this.teams[0].cards, this.teams[1].cards], this.trumpSuit, this.currBid);
        let team0Name = this.teams[0].name.join(" ");
        let team1Name = this.teams[1].name.join(" ");
        this.teams[0].points = teamPoints[0];
        this.teams[1].points = teamPoints[1];
        this.assignPoints();
        for (let user of this.getUsers()) {
            user.socket.emit('chat', `${team0Name} won ${this.printPoints(this.teams[0])}`);
            user.socket.emit('chat', `${team1Name} won ${this.printPoints(this.teams[1])}`);
            user.socket.emit('setProp', {
                prop: 'score',
                val: this.score
            });
        }
        if (!this.gameOver) {
            this.dealCards();
            this.teams = [{ name: this.teams[0].name, cards: [], points: [] }, { name: this.teams[1].name, cards: [], points: [] }];
        }
    }

    broadcastToLobby(prop, val) {
        for (let user of this.getUsers())
            user.socket.emit(prop, val);
    }

    callStoreMutation(mutation, val) {
        for (let user of this.getUsers())
            user.socket.emit('callStoreMutation', {
                mutation, val
            });
    }

    printPoints(team) {
        let pointText = team.points.join(", ");
        return (pointText ? pointText : "nothing")
    }

    shuffleArray(arr) {
        for (var i = arr.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }
    };

    rotateArray(arr, num) {
        arr = arr.slice(num, arr.length).concat(arr.slice(0, num))
        return arr;
    }

    makeid(length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    getUsers() {
        return this.users;
    }

    getUser(num) {
        return this.users[num];
    }

    getTeams(num) {
        if (num === undefined)
            return this.teams;
        else
            return this.teams[num];
    }

    addUser(user) {
        this.users.push(user);
    }

    removeUser(num) {
        this.users.splice(num, 1);
    }

    getCurrPlayer() {
        return this.currPlayer;
    }

    getTeamWords(num, partOfSpeech) {
        return this.teamWords[num][partOfSpeech];
    }
}

module.exports = Lobby