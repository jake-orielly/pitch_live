const constants = require('./constants.js');

function countGame(cards) {
  let pointsMap = [10, 1, 2, 3, 4];
  let total = 0;
  for (let card of cards)
    if (constants.nums.indexOf(card.num) > 7)
      total += pointsMap[constants.nums.indexOf(card.num) - 8];
  return total;
}

function countPoints(teamCards, trumpSuit, currBid) {
  const bidderTeam = currBid.player.teamNum;
  let high = { team: undefined, index: -1 };
  let low = { team: undefined, index: 14 };
  let game0, game1;
  let teamPoints = [[],[]];
  let currTeam = 0;
  for (let team of teamCards) {
    for (let card of team) {
      if (card.suit == trumpSuit) {
        if (card.num == 'Jack')
          teamPoints[currTeam].push('Jack');
        if (constants.nums.indexOf(card.num) < low.index) {
          low.team = teamPoints[currTeam]
          low.index = constants.nums.indexOf(card.num)
        }
        if (constants.nums.indexOf(card.num) > high.index) {
          high.team = teamPoints[currTeam]
          high.index = constants.nums.indexOf(card.num)
        }
      }
    }
    currTeam++;
  }
  // Because I like the order High, Low, Jack, Game
  low.team.unshift('Low');
  high.team.unshift('High');
  game0 = countGame(teamCards[0]);
  game1 = countGame(teamCards[1]);
  if (game0 > game1)
    teamPoints[0].push('Game');
  else if (game0 < game1)
    teamPoints[1].push('Game');
  if (currBid.amount == 5 && 
      teamPoints[bidderTeam].length == 4 &&
      teamCards[bidderTeam].length == 24)
    teamPoints[bidderTeam].push("Five")
  return teamPoints;
};

function evalWinner(currTrick, trumpSuit, leadSuit) {
  let winning = currTrick[0];
  let curr;
  for (let i = 0; i < currTrick.length; i++) {
    curr = currTrick[i]
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