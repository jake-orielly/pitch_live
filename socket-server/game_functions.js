const constants = require('./constants.js');

function countGame(cards) {
  let pointsMap = [10, 1, 2, 3, 4];
  let total = 0;
  for (let card of cards)
    if (constants.nums.indexOf(card.num) > 7)
      total += pointsMap[constants.nums.indexOf(card.num) - 8];
  return total;
}

function countPoints(teams, trumpSuit) {
  let high = { team: undefined, index: -1 };
  let low = { team: undefined, index: 14 };
  let curr, game0, game1;

  for (let team of teams)
    for (let j = 0; j < team.cards.length; j++) {
      curr = team.cards[j];
      if (curr.suit == trumpSuit) {
        if (curr.num == 'Jack')
          team.points.push('Jack');
        if (constants.nums.indexOf(curr.num) < low.index) {
          low.team = team.points
          low.index = constants.nums.indexOf(curr.num)
        }
        if (constants.nums.indexOf(curr.num) > high.index) {
          high.team = team.points
          high.index = constants.nums.indexOf(curr.num)
        }
      }
    }
  // Because I like the order High, Low, Jack, Game
  low.team.unshift('Low');
  high.team.unshift('High');
  game0 = countGame(teams[0].cards);
  game1 = countGame(teams[1].cards);
  if (game0 > game1)
    teams[0].points.push('Game');
  else if (game0 < game1)
    teams[1].points.push('Game');
  return teams;
};

function evalWinner(currBout, trumpSuit, leadSuit) {
  let winning = currBout[0];
  let curr;
  for (let i = 0; i < currBout.length; i++) {
    curr = currBout[i]
    if (curr.card.suit == trumpSuit && winning.card.suit != trumpSuit) {
      winning = curr;
    }
    else if (curr.card.suit == trumpSuit && constants.nums.indexOf(winning.card.num) < constants.nums.indexOf(curr.card.num)) {
      winning = curr;
    }
    else if (winning.card.suit != trumpSuit && curr.card.suit == leadSuit && constants.nums.indexOf(winning.card.num) < constants.nums.indexOf(curr.card.num))
      winning = curr;
  }
  return winning;
};

module.exports = { countGame, countPoints, evalWinner }