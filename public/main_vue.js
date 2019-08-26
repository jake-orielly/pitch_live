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
        nums: [1,2,3,4,5,6],
        game_stage: 'lobby',
        signed_in: false,
        users: [],
        username: '',
        game_starting: 0,
        trump_suit: '',
        lead_suit: '',
        curr_bout: 0
    },
    methods: {
        bid(given) {
            this.socket.emit('bid',given);
            this.status = ''
            this.status_text = ''
        },
        ready_click(name,ready) {
            console.log('Ready:',name,ready)
            if (name == 'self')
                name = this.username;
            if (name == this.username)
                this.socket.emit('ready',ready);
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
                            let destination = document.getElementsByClassName("played-pos-3")[0];
                            let target = document.getElementsByClassName("hand-card")[i];
                            this.move_card(destination,target);
                            this.curr_bout++;
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
            let destination = document.getElementsByClassName("card hand-card")[num];
            let target = document.getElementsByClassName("deck-card")[num];
            this.move_card(destination,target);
            return num + 1;
        },
        move_card(destination,target) {
            let dest_rect = destination.getBoundingClientRect();
            target.style.position = 'absolute'; 
            target.style.top = dest_rect.y + 'px';
            target.style.left = dest_rect.x + 'px';
            target.style["z-index"] = 10 + this.curr_bout;
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
            console.log(card)
            let face_map = {'Jack':'J','Queen':'Q','King':'K','Ace':'A'}
            let num = card.num;
            if (isNaN(num))
                num = face_map[num];
            return 'cards/' + num + card.suit[0] + '.png'
        },
        suit_to_icon(suit) {
            switch(suit) {
            case 'Clubs':
                return '♣';
            case 'Diamonds':
                return '♦';
            case 'Hearts':
                return '♥';
            case 'Spades':
                return '♠';
            default:
                return '';
            }
        }
    }
})