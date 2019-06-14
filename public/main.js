const master_deck = []
var deck;

const nums = []
const suits = ["Spades","Clubs","Hearts","Diamonds"]

const faces = ["Jack","Queen","King","Ace"]

var hand = [];

function create_deck() {
    for (let i = 2; i < 11; i++)
        nums.push(i)

    for (let i = 0; i < faces.length; i++)
        nums.push(faces[i])

    for (let i = 0; i < nums.length; i++)
        for (let j = 0; j < suits.length; j++)
            master_deck.push(nums[i] + ' of ' + suits[j])
}

function random_deck_index() {
    let max = 52
    let min = 0
    return parseInt(Math.random() * (max - min) + min);
}

function random_num_is_fair() {
    let trials = 10000000;
    let average = trials/52;
    let nums_count = []
    for (let i = 0; i < 52; i++)
        nums_count[i] = 0;
    for (let i = 0; i < trials; i++)
        nums_count[random_deck_index()]++;
    for (let i = 0; i < 52; i++) {
        nums_count[i] /= average
        //nums_count[i] = parseInt(nums_count[i] * 100)
    }
    console.log(nums_count)
    return 1
}

function shuffle(){
    let new_master = Array.from(master_deck)
    let new_deck = []
    let count = random_deck_index()
    while (new_master.length) {
        choice = count%(new_master.length-1)
        if (Math.random() > 0.5)
            new_deck.push(new_master[choice])
        else 
            new_deck.unshift(new_master[choice])
        new_master.splice(choice,1)
        count += 1
    }
    console.log(new_deck)
    return new_deck
}

function deal(){ 
    for (var i = 0; i < 6; i++)
        hand.push(deck.pop())
}

create_deck()
//for (let i = 0; i < 10; i++)
deck = shuffle()
deal()

console.log(hand);