var vue_app = new Vue({
    el: '#vue-app',
    data: {
        message: 'Hello Vue!',
        socket: undefined,
        hand: [],
        status: '',
        status_text: '',
        dealer: false,
        curr_play: true
    },
    methods: {
        bid(given) {
            if (!this.dealer)
                this.socket.emit('bid',given);
            else
                this.socket.emit('dealer_bid',given)
            this.status = ''
            this.status_text = ''
        },
        play(card) {
            this.socket.emit('play',card)
            this.curr_play = false;
        }
    }
})