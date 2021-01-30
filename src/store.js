import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const Store = new Vuex.Store({
    state: {
        leader: "",
        leadSuit: "",
        trumpSuit: "",
        dealer: false,
        teamNames: [],
        currBid: 0,
        deckCards: 20
    },
    mutations: {
        dealCard() {
            this.deckCards--;
        },
        resetDeck() {
            this.deckCards = 20;
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