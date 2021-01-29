const assert = require('assert');
const deckFunctions = require('/home/jake/pitch-live/socket-server/deck_functions.js');
const gameFunctions = require('/home/jake/pitch-live/socket-server/game_functions.js');

describe('Deck Functions', function() {
  describe('shuffle()', function() {
    it('check that we\'re getting 52 different cards', function() {
      let deck = deckFunctions.shuffle();
      let found = {};
      let key;
      assert(deck.length, 52);
      for (let i of deck) {
        key = `${i.num}-${i.suit}`;
        assert.strictEqual(typeof(found[key]), "undefined");
        found[key] = true;
      }
    });
  });
});

describe('Game Functions', function() {
  describe('point counting', function() {
    it('check that we correctly count bout points #1', function() {
      let cards = [
        {num:"Ace", suit:"Spades"},
        {num:"King", suit:"Spades"},
        {num:"Queen", suit:"Spades"},
        {num:4, suit:"Hearts"},
        {num:10, suit:"Hearts"},
        {num:"Queen", suit:"Hearts"}
      ];
      let points = gameFunctions.countGame(cards);
      assert(points, 23);
    });
    it('check that we correctly count bout points #1', function() {
      let team0 = {
        cards:[
          {num:"Ace", suit:"Spades"},
          {num:"King", suit:"Spades"},
          {num:"Queen", suit:"Spades"},
          {num:"Jack", suit:"Spades"},
          {num:5, suit:"Spades"},
          {num:6, suit:"Spades"}
        ],
        points:[]
      };

      let team1 = {
        cards:[
          {num:2, suit:"Diamonds"},
          {num:3, suit:"Diamonds"},
          {num:4, suit:"Diamonds"},
          {num:5, suit:"Diamonds"},
          {num:6, suit:"Diamonds"},
          {num:10, suit:"Diamonds"}
        ],
        points:[]
      };

      let teams = [team0, team1];

      result = gameFunctions.countPoints(teams, "Spades");
      assert.deepStrictEqual(result[0].points, ["Jack", "High", "Low"]);
      assert.deepStrictEqual(result[1].points, []);
    });
    it('check that we correctly count bout points #2', function() {
      let team0 = {
        cards:[
          {num:"Ace", suit:"Spades"},
          {num:"King", suit:"Spades"},
          {num:"Queen", suit:"Spades"},
          {num:"Jack", suit:"Spades"},
          {num:5, suit:"Spades"},
          {num:6, suit:"Spades"}
        ],
        points:[]
      };

      let team1 = {
        cards:[
          {num:"Queen", suit:"Diamonds"},
          {num:3, suit:"Clubs"},
          {num:4, suit:"Clubs"},
          {num:5, suit:"Clubs"},
          {num:6, suit:"Clubs"},
          {num:7, suit:"Clubs"}
        ],
        points:[]
      };

      let teams = [team0, team1];

      result = gameFunctions.countPoints(teams, "Diamonds");
      assert.deepStrictEqual(result[0].points, ["Game"]);
      assert.deepStrictEqual(result[1].points, ["High","Low"]);
    });
    it('check that we correctly count bout points #3', function() {
      let team0 = {
        cards:[
          {num:"Ace", suit:"Spades"},
          {num:"King", suit:"Spades"},
          {num:"Queen", suit:"Spades"},
          {num:4, suit:"Hearts"},
          {num:10, suit:"Hearts"},
          {num:"Queen", suit:"Hearts"}
        ],
        points:[]
      };

      let team1 = {
        cards:[
          {num:"Queen", suit:"Diamonds"},
          {num:3, suit:"Hearts"},
          {num:"Jack", suit:"Hearts"},
          {num:"Ace", suit:"Clubs"},
          {num:10, suit:"Clubs"},
          {num:7, suit:"Clubs"}
        ],
        points:[]
      };

      let teams = [team0, team1];

      result = gameFunctions.countPoints(teams, "Hearts");
      assert.deepStrictEqual(result[0].points, ["Game","High"]);
      assert.deepStrictEqual(result[1].points, ["Jack","Low"]);
    });
  });
});