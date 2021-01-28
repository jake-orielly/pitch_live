const constants = require('./constants.js')

var masterDeck = []

function createDeck() {
  for (let i = 0; i < constants.nums.length; i++)
    for (let j = 0; j < constants.suits.length; j++)
      masterDeck.push({ num: constants.nums[i], suit: constants.suits[j] })
}

function shuffle() {
  let newMaster = Array.from(masterDeck)
  let newDeck = []

  for (let i = 0; i < 52; i++)
    newDeck.push(0)

  let newPos
  while (newMaster.length) {
    newPos = parseInt(Math.random() * 52)
    while (newDeck[newPos] != 0)
      newPos = (newPos + 1) % 52
    newDeck[newPos] = newMaster.pop()
  }
  return newDeck
}

module.exports = {
  createDeck, shuffle
}