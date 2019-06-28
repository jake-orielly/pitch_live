var vue_app = new Vue({
    el: '#vue-app',
    data: {
        message: 'Hello Vue!',
        socket: undefined,
        hand: [],
        status: '',
        status_text: '',
        dealer: false,
        curr_play: false
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
            if (this.curr_play) {
                let suit = card.split(' ')[2]
                let legal = true;
                if (this.lead_suit && this.lead_suit != suit && this.trump_suit != suit)
                    for (var i = 0; i < this.hand.length; i++)
                        if (this.hand[i].split(' ')[2] == this.lead_suit)
                            legal = false;
                if (!legal)
                    alert("Illegal move, you must follow")
                else {
                    this.socket.emit('play',card)
                    this.curr_play = false;
                }
                return;
            }
        }
    }
})