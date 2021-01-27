import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const Store = new Vuex.Store({
    state: {
        leader: "",
        leadSuit: ""
    },
    mutations: {
        setLeader(state, val) {
            state.leader = val;
        },
        setLeadSuit(state, val) {
            state.leadSuit = val;
        }
    }
})

export default Store