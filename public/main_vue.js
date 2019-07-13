var vue_app = new Vue({
    el: '#vue-app',
    data: {
        message: 'Hello Vue!',
        socket: undefined,
        hand: [],
        status: '',
        status_text: '',
        dealer: false,
        curr_play: false,
        score: [0,0],
        nums: [1,2,3,4,5,6]
    },
    methods: {
        bid(given) {
            this.socket.emit('bid',given);
            this.status = ''
            this.status_text = ''
        },
        play(card) {
            if (this.curr_play) {
                let legal = true;
                if (this.lead_suit && this.lead_suit != card.suit && this.trump_suit != card.suit)
                    for (var i = 0; i < this.hand.length; i++)
                        if (this.hand[i].suit == this.lead_suit)
                            legal = false;
                if (!legal)
                    alert("Illegal move, you must follow")
                else {
                    this.socket.emit('play',card)
                    this.curr_play = false;
                    for (let i = 0; i < this.hand.length; i++)
                        if (this.hand[i].suit == card.suit && this.hand[i].num == card.num) {
                            this.hand.splice(i,1)
                            break;
                        }
                }
                return;
            }
        },
        deal() {
            let count = 0;
            let interval = setInterval(function() {
                if (count == 6)
                    interval = clearInterval(interval);
                else
                    count = vue_app.deal_card(count);
            },500)
        },
        deal_card(num) {
            $(".deck-card").eq(num).addClass("deck-card-dealt-" + num);
            return num + 1;
        },
        get_card_image(card) {
            if (card == 'back')
                return 'cards/red_back.png';
            let face_map = {'Jack':'J','Queen':'Q','King':'K','Ace':'A'}
            let num = card.num;
            if (isNaN(num))
                num = face_map[num];
            return 'cards/' + num + card.suit[0] + '.png'
        }
    }
})