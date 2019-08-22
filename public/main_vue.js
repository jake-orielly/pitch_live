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
        deal_done: false,
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
            if (this.curr_play && !card.played) {
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
                            card.played = true;
                            let destination = document.getElementById("played-pile");
                            let target = document.getElementsByClassName("hand-card")[i];
                            this.move_card(destination,target);
                            break;
                        }
                }
                return;
            }
        },
        deal(hand) {
            let count = 0;
            this.hand = hand;
            this.deal_done = false;
            let interval = setInterval(function() {
                if (count == 6) {
                    interval = clearInterval(interval);
                    this.deal_done = true;
                    setTimeout(()=>vue_app.card_switch(),700)
                }
                else
                    count = vue_app.deal_card(count);
            },500)
        },
        deal_card(num) {
            let destination = document.getElementsByClassName("hand-card-slot")[num];
            let target = document.getElementsByClassName("deck-card")[num];
            this.move_card(destination,target);
            return num + 1;
        },
        move_card(destination,target,offset_x = 0) {
            /* Issue with absolute move, investigate this:
            var bodyRect = document.body.getBoundingClientRect(),
            elemRect = element.getBoundingClientRect(),
            offset   = elemRect.top - bodyRect.top;

            alert('Element is ' + offset + ' vertical pixels from <body>');
            */
            let left_pos = destination.offsetLeft;
            let top_pos = destination.offsetTop;
            let left_diff = left_pos - target.offsetLeft + offset_x;
            let top_diff = top_pos - target.offsetTop;
            target.style.transform = "translate(" + left_diff + "px," + top_diff +"px";  
        },
        card_switch() {
            let card_backs = document.getElementsByClassName('deck-card');
            let hand_cards = document.getElementsByClassName('hand-card');
            for (var i = 0; i < 6; i++)
                card_backs[i].style.display = "none";
            for (var i = 0; i < hand_cards.length; i++)
                hand_cards[i].style.visibility = "visible";
            
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