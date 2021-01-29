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
  game0 = countGame(teams[0].cards);
  game1 = countGame(teams[1].cards);
  if (game0 > game1)
    teams[0].points.push('Game');
  else if (game0 < game1)
    teams[1].points.push('Game');
  high.team.push('High');
  low.team.push('Low');
  return teams;
};

module.exports = { countGame, countPoints }