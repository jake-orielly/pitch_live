import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const Store = new Vuex.Store({
    state: {
        leader: "",
        leadSuit: "",
        trumpSuit: "",
        dealer: false,
        currBid: 0
    },
    mutations: {
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
        setTrumpSuit(state, val) {
            state.trumpSuit = val;
        }
    }
})

export default Store