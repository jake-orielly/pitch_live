const teamNameWords = require('./team_name_words.js');

class Lobby {
    constructor() {
        this.id = makeid(4);
        this.teams = [{ name: [], cards: [], points: [] }, { name: [], cards: [], points: [] }];
        this.teamWords = this.generateTeamWords();
    }

    generateTeamWords() {
        let adjectives = teamNameWords.adjectives.slice();
        let nouns = teamNameWords.nouns.slice();
        const numOptions = 3;
    
        shuffleArray(adjectives);
        shuffleArray(nouns);
    
        const team0Adjectives = adjectives.slice(0, numOptions);
        const team0Nouns = nouns.slice(0, numOptions);
        const team1Adjectives = adjectives.slice(numOptions, numOptions * 2);
        const team1Nouns = nouns.slice(numOptions, numOptions * 2);
    
        // Default values in case users don't make a selection
        this.teams[0].name = [team0Adjectives[0], team0Nouns[0]];
        this.teams[1].name = [team1Adjectives[0], team1Nouns[0]];
        return [
            { adjectives: team0Adjectives, nouns: team0Nouns },
            { adjectives: team1Adjectives, nouns: team1Nouns }
        ]
    };
}

function shuffleArray(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
};

function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

module.exports = Lobby