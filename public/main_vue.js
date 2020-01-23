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
        leader: '',
        curr_bout: 0,
        others_cards: ['placeholder','placeholder','placeholder'],
        my_card: 'placeholder',
        curr_bid: undefined,
        login_status: undefined,
        login_status_map: {'success':'Success','failure':'Password Incorrect','bad-user':'User does not exist'},
        signup_status: undefined,
        user_confirm: {'guest':'Confirm','existing':'Log In','new':'Sign Up'},
        user_mode: ''
    },
    methods: {
        confirm_click() {
            switch(this.user_mode) {
                case 'guest':
                    this.guest_confirm();
                    break;
                case 'existing':
                    this.login();
                    break;
                case 'new':
                    this.create_account();
                    break;
            }
        },
        set_user_mode(given) {
            this.user_mode = given;
            setTimeout(()=>{
                $('#username-input').focus()
            },2)
        },
        guest_confirm() {
            submitUsername();
        },
        login(){
            const Http = new XMLHttpRequest();
            let username = $('#username-input').val();
            let password = $('#password-input').val();
            const url=`http://23.254.164.217:8000/login?user=${username}&password=${password}`;
            Http.open("POST", url);
            Http.send();
        
            Http.onreadystatechange = (e) => {
                if (Http.readyState == 4) {
                    var result = JSON.parse(Http.responseText)
                    this.login_status = result.message;
                }
            }
        },
        create_account(){
            const Http = new XMLHttpRequest();
            let username = $('#username-input').val();
            let password = $('#password-input').val();
            const url=`http://23.254.164.217:8000/sign-up?user=${username}&password=${password}`;
            Http.open("POST", url);
            Http.send();
        
            Http.onreadystatechange = (e) => {
                if (Http.readyState == 4) {
                    var result = JSON.parse(Http.responseText)
                    if (result.message)
                        this.signup_status = result.message;
                    else if (result.error)
                        this.signup_status = 'Error: ' + result.error;
                    else
                        this.signup_status = 'Error: Uknown Error';
                }
            }
        },
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
                            this.hand.splice(i,1)
                            //let destination = document.getElementById("played-pos-3");
                            //let target = document.getElementsByClassName("hand-card")[i];
                            //console.log(destination,target)
                            //this.move_card(destination,target);
                            this.my_card = card;
                            this.curr_bout++;
                            break;
                        }
                }
                return;
            }
        },
        other_played(data) {
            /*let target;
            let destination;
            let opponents;
            let my_team = this._data.users.filter(user => user.username == this.username)[0].team;
            let their_team = this._data.users.filter(user => user.username == data.user)[0].team;*/
            function find_user(element) {
                return element.username == data.user;
            }
            let their_index = this.users.findIndex(find_user);
            Vue.set(this.others_cards, their_index, data.card);
            /*if (my_team == their_team) {
                target = document.getElementsByClassName("teammate-1")[this.curr_bout];
                destination = document.getElementById("played-pos-1");
            }
            else {
                opponents = this.users.filter(user => user.team == 1);
                for (var i = 0; i < opponents.length; i++)
                    if (opponents[i].username == data.user) {
                        console.log("opponent-" + i + "-card")
                        target = document.getElementsByClassName("opponent-" + i + "-card")[this.curr_bout];
                        destination = document.getElementById("played-pos-" + i*2);
                    }
            }
            console.log("Other play")
            console.log(target)
            console.log(destination)
            this.move_card(destination,target);*/

        },
        new_bout() {
            this.others_cards = ['placeholder','placeholder','placeholder'];
            this.my_card = 'placeholder';
        },
        deal(hand) {
            let count = 0;
            this.hand = hand;
            this.deal_done = false;
            document.getElementById('hand-container').style.display = "block";
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
            if (card == 'placeholder')
                return 'cards/placeholder.png';
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