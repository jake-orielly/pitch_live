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
      let team0 = [
        {num:'Ace', suit:'Spades'},
        {num:'King', suit:'Spades'},
        {num:'Queen', suit:'Spades'},
        {num:'Jack', suit:'Spades'},
        {num:5, suit:'Spades'},
        {num:6, suit:'Spades'}
      ];

      let team1 = [
          {num:2, suit:'Diamonds'},
          {num:3, suit:'Diamonds'},
          {num:4, suit:'Diamonds'},
          {num:5, suit:'Diamonds'},
          {num:6, suit:'Diamonds'},
          {num:10, suit:'Diamonds'}
      ];

      let teamCards = [team0, team1];
      const bid = {amount:3,player:{teamNum:0}};
      result = gameFunctions.countPoints(teamCards, 'Spades', bid);
      assert.deepStrictEqual(result[0], ['High', 'Low', 'Jack']);
      assert.deepStrictEqual(result[1], []);
    });
    it('check that we correctly count trick points #2', function() {
      let team0 = [
        {num:'Ace', suit:'Spades'},
        {num:'King', suit:'Spades'},
        {num:'Queen', suit:'Spades'},
        {num:'Jack', suit:'Spades'},
        {num:5, suit:'Spades'},
        {num:6, suit:'Spades'}
      ];

      let team1 = [
        {num:'Queen', suit:'Diamonds'},
        {num:3, suit:'Clubs'},
        {num:4, suit:'Clubs'},
        {num:5, suit:'Clubs'},
        {num:6, suit:'Clubs'},
        {num:7, suit:'Clubs'}
      ];

      let teamCards = [team0, team1];
      const bid = {amount:3,player:{teamNum:0}};
      result = gameFunctions.countPoints(teamCards, 'Diamonds', bid);
      assert.deepStrictEqual(result[0], ['Game']);
      assert.deepStrictEqual(result[1], ['High','Low']);
    });
    it('check that we correctly count trick points #3', function() {
      let team0 = [
        {num:'Ace', suit:'Spades'},
        {num:'King', suit:'Spades'},
        {num:'Queen', suit:'Spades'},
        {num:4, suit:'Hearts'},
        {num:10, suit:'Hearts'},
        {num:'Queen', suit:'Hearts'}
      ];

      let team1 = [
        {num:'Queen', suit:'Diamonds'},
        {num:3, suit:'Hearts'},
        {num:'Jack', suit:'Hearts'},
        {num:'Ace', suit:'Clubs'},
        {num:10, suit:'Clubs'},
        {num:7, suit:'Clubs'}
      ];

      let teamCards = [team0, team1];
      const bid = {amount:3,player:{teamNum:0}};
      result = gameFunctions.countPoints(teamCards, 'Hearts', bid);
      assert.deepStrictEqual(result[0], ['High', 'Game']);
      assert.deepStrictEqual(result[1], ['Low', 'Jack']);
    });
    it('check that we correctly count trick points #4', function() {
      let team0 = [
        {num:'Ace', suit:'Spades'},
        {num:'King', suit:'Spades'},
        {num:'Queen', suit:'Spades'},
        {num:'Jack', suit:'Spades'},
        {num:5, suit:'Spades'},
        {num:6, suit:'Spades'}
      ];

      let team1 = [
        {num:2, suit:'Diamonds'},
        {num:3, suit:'Diamonds'},
        {num:4, suit:'Diamonds'},
        {num:5, suit:'Diamonds'},
        {num:6, suit:'Diamonds'},
        {num:7, suit:'Diamonds'}
      ];

      let teamCards = [team0, team1];
      const bid = {amount:3,player:{teamNum:0}};
      result = gameFunctions.countPoints(teamCards, 'Spades', bid);
      assert.deepStrictEqual(result[0], ['High', 'Low', 'Jack', 'Game']);
      assert.deepStrictEqual(result[1], []);
    });
    it('test 5 bid case #1', function() {
      let team0 = [
        {num:'Ace', suit:'Spades'},
        {num:'King', suit:'Spades'},
        {num:'Queen', suit:'Spades'},
        {num:'Jack', suit:'Spades'},
        {num:5, suit:'Spades'},
        {num:6, suit:'Spades'},
        {num:'Ace', suit:'Clubs'},
        {num:'King', suit:'Clubs'},
        {num:'Queen', suit:'Clubs'},
        {num:'Jack', suit:'Clubs'},
        {num:5, suit:'Clubs'},
        {num:6, suit:'Clubs'},
        {num:'Ace', suit:'Hearts'},
        {num:'King', suit:'Hearts'},
        {num:'Queen', suit:'Hearts'},
        {num:'Jack', suit:'Hearts'},
        {num:5, suit:'Hearts'},
        {num:6, suit:'Hearts'},
        {num:'Ace', suit:'Diamonds'},
        {num:'King', suit:'Diamonds'},
        {num:'Queen', suit:'Diamonds'},
        {num:'Jack', suit:'Diamonds'},
        {num:5, suit:'Diamonds'},
        {num:6, suit:'Diamonds'},
      ];

      let team1 = [];

      let teamCards = [team0, team1];
      const bid = {amount:5,player:{teamNum:0}};
      result = gameFunctions.countPoints(teamCards, 'Spades', bid);
      assert.deepStrictEqual(result[0], ['High', 'Low', 'Jack', 'Game', 'Five']);
      assert.deepStrictEqual(result[1], []);
    });
    it('test 5 bid case #2', function() {
      let team0 = [
        {num:'Ace', suit:'Spades'},
        {num:'King', suit:'Spades'},
        {num:'Queen', suit:'Spades'},
        {num:'Jack', suit:'Spades'},
        {num:5, suit:'Spades'},
        {num:6, suit:'Spades'},
        {num:'Ace', suit:'Clubs'},
        {num:'King', suit:'Clubs'},
        {num:'Queen', suit:'Clubs'},
        {num:'Jack', suit:'Clubs'},
        {num:5, suit:'Clubs'},
        {num:6, suit:'Clubs'},
        {num:'Ace', suit:'Hearts'},
        {num:'King', suit:'Hearts'},
        {num:'Queen', suit:'Hearts'},
        {num:'Jack', suit:'Hearts'},
        {num:5, suit:'Hearts'},
        {num:6, suit:'Hearts'},
        {num:'Ace', suit:'Diamonds'},
        {num:'King', suit:'Diamonds'},
        {num:'Queen', suit:'Diamonds'},
        {num:'Jack', suit:'Diamonds'},
        {num:5, suit:'Diamonds'},
        {num:6, suit:'Diamonds'},
      ];

      let team1 = [];

      let teamCards = [team0, team1];
      const bid = {amount:4,player:{teamNum:0}};
      result = gameFunctions.countPoints(teamCards, 'Spades', bid);
      assert.deepStrictEqual(result[0], ['High', 'Low', 'Jack', 'Game']);
      assert.deepStrictEqual(result[1], []);
    });
    it('test 5 bid case #3', function() {
      let team0 = [
        {num:'Ace', suit:'Spades'},
        {num:'King', suit:'Spades'},
        {num:'Queen', suit:'Spades'},
        {num:'Jack', suit:'Spades'},
        {num:5, suit:'Spades'},
        {num:6, suit:'Spades'},
        {num:'Ace', suit:'Clubs'},
        {num:'King', suit:'Clubs'},
        {num:'Queen', suit:'Clubs'},
        {num:'Jack', suit:'Clubs'},
        {num:5, suit:'Clubs'},
        {num:6, suit:'Clubs'},
        {num:'Ace', suit:'Hearts'},
        {num:'King', suit:'Hearts'},
        {num:'Queen', suit:'Hearts'},
        {num:'Jack', suit:'Hearts'},
        {num:5, suit:'Hearts'},
        {num:6, suit:'Hearts'},
        {num:'Ace', suit:'Diamonds'},
        {num:'King', suit:'Diamonds'},
      ];

      let team1 = [
        {num:'Queen', suit:'Diamonds'},
        {num:'Jack', suit:'Diamonds'},
        {num:5, suit:'Diamonds'},
        {num:6, suit:'Diamonds'},
      ];

      let teamCards = [team0, team1];
      const bid = {amount:5,player:{teamNum:0}};
      result = gameFunctions.countPoints(teamCards, 'Spades', bid);
      assert.deepStrictEqual(result[0], ['High', 'Low', 'Jack', 'Game']);
      assert.deepStrictEqual(result[1], []);
    });
    it('test 5 bid case #4', function() {
      let team0 = [
        {num:'Ace', suit:'Spades'},
        {num:'King', suit:'Spades'},
        {num:'Queen', suit:'Spades'},
        {num:'Jack', suit:'Spades'},
        {num:5, suit:'Spades'},
        {num:6, suit:'Spades'},
        {num:'Ace', suit:'Clubs'},
        {num:'King', suit:'Clubs'},
        {num:'Queen', suit:'Clubs'},
        {num:'Jack', suit:'Clubs'},
        {num:5, suit:'Clubs'},
        {num:6, suit:'Clubs'},
        {num:'Ace', suit:'Hearts'},
        {num:'King', suit:'Hearts'},
        {num:'Queen', suit:'Hearts'},
        {num:'Jack', suit:'Hearts'},
        {num:5, suit:'Hearts'},
        {num:6, suit:'Hearts'},
        {num:'Ace', suit:'Diamonds'},
        {num:'King', suit:'Diamonds'},
        {num:'Queen', suit:'Diamonds'},
        {num:'Jack', suit:'Diamonds'},
        {num:5, suit:'Diamonds'},
        {num:6, suit:'Diamonds'},
      ];

      let team1 = [];

      let teamCards = [team0, team1];
      const bid = {amount:5,player:{teamNum:1}};
      result = gameFunctions.countPoints(teamCards, 'Spades', bid);
      assert.deepStrictEqual(result[0], ['High', 'Low', 'Jack', 'Game']);
      assert.deepStrictEqual(result[1], []);
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