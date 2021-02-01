import Vue from 'vue'
import Vuex from 'vuex'
import { EventBus } from './event-bus.js';

Vue.use(Vuex)

const Store = new Vuex.Store({
    state: {
        leader: "",
        leadSuit: "",
        trumpSuit: "",
        dealer: false,
        teamNames: [],
        currBid: 0,
        deckCards: 20,
        winningTeam: "",
        id: undefined,
        users: [],
        teamWordOptions: [],
        teammatesWord: ""
    },
    mutations: {
        setUsers(state, val) {
            state.users = JSON.parse(val);
        },
        setTeammatesWord(state, val) {
            state.teammatesWord = val;
        },
        setTeamWordOptions(state, val) {
            state.teamWordOptions = val;
        },
        setId(state, val) {
            state.id = val;
        },
        dealCard(state) {
            state.deckCards--;
        },
        gameOver(state, team) {
            state.winningTeam = team;
            EventBus.$emit('game-over');
        },
        resetDeck(state) {
            state.deckCards = 20;
        },
        setCurrBid(state, val) {
            state.currBid = val;
        },
        setDealer(state, val) {
            state.dealer = val;
        },
        setLeader(state, val) {
            state.leader = val;
        },
        setLeadSuit(state, val) {
            state.leadSuit = val;
        },
        setTeamNames(state, val) {
            state.teamNames = val;
        },
        setTrumpSuit(state, val) {
            state.trumpSuit = val;
        }
    }
})

export default Store