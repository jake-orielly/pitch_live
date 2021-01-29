const assert = require('assert');
const deckFunctions = require('/home/jake/pitch-live/socket-server/deck_functions.js')

describe('Deck Functions', function() {
  describe('#shuffle()', function() {
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

//{ num: 4, suit: 'Diamonds' }