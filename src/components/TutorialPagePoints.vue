<template>
  <div>
    <p class="title">Points</p>
    <p>There are 4 points available in each hand. High, low, jack, and game.</p>
    <p>
      <strong>High:</strong> Your team takes the highest available card of the
      trump suit.
    </p>
    <p>
      <strong>Low:</strong> Your team takes the lowest available card of the
      trump suit.
    </p>
    <p><strong>Jack:</strong> Your team takes the Jack of the trump suit.</p>
    <p>
      <strong>Game:</strong> The team that takes the most "Game Points". Aces
      are worth 4 points, Kings 3, Queens 2, and Jacks 1. 10's are worth 10
      points! Suit does not matter, and all other cards have no value.
    </p>
    <p>
      Not all of the points are available every game. Sometimes, no one gets
      dealt the Jack of the trump suit, and if the team's game points are tied at
      the end of the hand, neither gets the point. Keep this in mind when making
      your bids!
    </p>
    <p>
      Once the hand is over, a new hand will be dealt. Play continues until one
      team reaches 11 points, and is declared winner! If both teams reach 11
      points in the same hand, the team that bid wins.
    </p>
  </div>
</template>

<style lang="scss" scoped>
@import "../scss/tutorial_page.scss";
</style>