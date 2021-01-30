const assert = require('assert');
const gameFunctions = require('../socket-server/game_functions.js');

describe('Game Functions', function() {
  describe('game point counting', function() {
    it('check that we correctly count game points #1', function() {
      let cards = [
        {num:'Ace', suit:'Spades'},
        {num:'King', suit:'Spades'},
        {num:'Queen', suit:'Spades'},
        {num:4, suit:'Hearts'},
        {num:10, suit:'Hearts'},
        {num:'Queen', suit:'Hearts'}
      ];
      let points = gameFunctions.countGame(cards);
      assert(points, 23);
    });
    it('check that we correctly count game points #2', function() {
      let cards = [
        {num:'Jack', suit:'Spades'},
        {num:'King', suit:'Clubs'},
        {num:5, suit:'Hearts'},
        {num:4, suit:'Hearts'},
        {num:'Queen', suit:'Diamonds'},
        {num:'Queen', suit:'Hearts'}
      ];
      let points = gameFunctions.countGame(cards);
      assert(points, 8);
    });
  });
  describe('trick point counting', function() {
    it('check that we correctly count trick points #1', function() {
      let team0 = {
        cards:[
          {num:'Ace', suit:'Spades'},
          {num:'King', suit:'Spades'},
          {num:'Queen', suit:'Spades'},
          {num:'Jack', suit:'Spades'},
          {num:5, suit:'Spades'},
          {num:6, suit:'Spades'}
        ],
        points:[]
      };

      let team1 = {
        cards:[
          {num:2, suit:'Diamonds'},
          {num:3, suit:'Diamonds'},
          {num:4, suit:'Diamonds'},
          {num:5, suit:'Diamonds'},
          {num:6, suit:'Diamonds'},
          {num:10, suit:'Diamonds'}
        ],
        points:[]
      };

      let teams = [team0, team1];

      result = gameFunctions.countPoints(teams, 'Spades');
      assert.deepStrictEqual(result[0].points, ['High', 'Low', 'Jack']);
      assert.deepStrictEqual(result[1].points, []);
    });
    it('check that we correctly count trick points #2', function() {
      let team0 = {
        cards:[
          {num:'Ace', suit:'Spades'},
          {num:'King', suit:'Spades'},
          {num:'Queen', suit:'Spades'},
          {num:'Jack', suit:'Spades'},
          {num:5, suit:'Spades'},
          {num:6, suit:'Spades'}
        ],
        points:[]
      };

      let team1 = {
        cards:[
          {num:'Queen', suit:'Diamonds'},
          {num:3, suit:'Clubs'},
          {num:4, suit:'Clubs'},
          {num:5, suit:'Clubs'},
          {num:6, suit:'Clubs'},
          {num:7, suit:'Clubs'}
        ],
        points:[]
      };

      let teams = [team0, team1];

      result = gameFunctions.countPoints(teams, 'Diamonds');
      assert.deepStrictEqual(result[0].points, ['Game']);
      assert.deepStrictEqual(result[1].points, ['High','Low']);
    });
    it('check that we correctly count trick points #3', function() {
      let team0 = {
        cards:[
          {num:'Ace', suit:'Spades'},
          {num:'King', suit:'Spades'},
          {num:'Queen', suit:'Spades'},
          {num:4, suit:'Hearts'},
          {num:10, suit:'Hearts'},
          {num:'Queen', suit:'Hearts'}
        ],
        points:[]
      };

      let team1 = {
        cards:[
          {num:'Queen', suit:'Diamonds'},
          {num:3, suit:'Hearts'},
          {num:'Jack', suit:'Hearts'},
          {num:'Ace', suit:'Clubs'},
          {num:10, suit:'Clubs'},
          {num:7, suit:'Clubs'}
        ],
        points:[]
      };

      let teams = [team0, team1];

      result = gameFunctions.countPoints(teams, 'Hearts');
      assert.deepStrictEqual(result[0].points, ['High', 'Game']);
      assert.deepStrictEqual(result[1].points, ['Low', 'Jack']);
    });
    it('check that we correctly count trick points #4', function() {
      let team0 = {
        cards:[
          {num:'Ace', suit:'Spades'},
          {num:'King', suit:'Spades'},
          {num:'Queen', suit:'Spades'},
          {num:'Jack', suit:'Spades'},
          {num:5, suit:'Spades'},
          {num:6, suit:'Spades'}
        ],
        points:[]
      };

      let team1 = {
        cards:[
          {num:2, suit:'Diamonds'},
          {num:3, suit:'Diamonds'},
          {num:4, suit:'Diamonds'},
          {num:5, suit:'Diamonds'},
          {num:6, suit:'Diamonds'},
          {num:7, suit:'Diamonds'}
        ],
        points:[]
      };

      let teams = [team0, team1];

      result = gameFunctions.countPoints(teams, 'Spades');
      assert.deepStrictEqual(result[0].points, ['High', 'Low', 'Jack', 'Game']);
      assert.deepStrictEqual(result[1].points, []);
    });
  });
  describe('trick winner', function() {
    it('check that we correctly judge trick winner #1', function() {
      let trick = [
        { 
          user: { username: 'User1',},
          card: { num: 'Ace', suit: 'Clubs' }
        },
        { 
          user: { username: 'User2',},
          card: { num: 8, suit: 'Clubs' }
        },
        { 
          user: { username: 'User3',},
          card: { num: 2, suit: 'Hearts' }
        },
        { 
          user: { username: 'User4',},
          card: { num: 3, suit: 'Clubs' }
        }
      ]
      let winner = gameFunctions.evalWinner(trick, 'Clubs', 'Clubs');
      assert(winner.user.username, 'User1');
    });
    it('check that we correctly judge trick winner #2', function() {
      let trick = [
        { 
          user: { username: 'User1',},
          card: { num: 'Ace', suit: 'Clubs' }
        },
        { 
          user: { username: 'User2',},
          card: { num: 8, suit: 'Clubs' }
        },
        { 
          user: { username: 'User3',},
          card: { num: 2, suit: 'Hearts' }
        },
        { 
          user: { username: 'User4',},
          card: { num: 3, suit: 'Clubs' }
        }
      ]
      let winner = gameFunctions.evalWinner(trick, 'Hearts', 'Clubs');
      assert(winner.user.username, 'User3');
    });
    it('check that we correctly judge trick winner #3', function() {
      let trick = [
        { 
          user: { username: 'User1',},
          card: { num: 5, suit: 'Clubs' }
        },
        { 
          user: { username: 'User2',},
          card: { num: 8, suit: 'Clubs' }
        },
        { 
          user: { username: 'User3',},
          card: { num: 2, suit: 'Hearts' }
        },
        { 
          user: { username: 'User4',},
          card: { num: 3, suit: 'Clubs' }
        }
      ]
      let winner = gameFunctions.evalWinner(trick, 'Diamons', 'Clubs');
      assert(winner.user.username, 'User2');
    });
  });
});