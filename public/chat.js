function chat_setup() {
    // get dom elements
    var sendBtn = document.getElementById('send');
    var messages = document.getElementById('messages');

    // add click listener to our button
    sendBtn.addEventListener('click', function() {
        send_message();
    });

    // Listen for chat events
    socket.on('chat', function(data) {
    // When we receive a “chat” event, display the message to the user
    if (typeof data == 'string')
        messages.innerHTML += '<p><strong>' + data + '</p></strong>';
    else
        messages.innerHTML += '<p><strong>' + data.username + ': </strong>' + data.message + '</p>';
    });
    
    // Listen for deal events
    socket.on('deal', function(data) {
        vue_app.hand = data;
    });

    socket.on('dealer_assign',function() {
        vue_app.dealer = true;
    })

    socket.on('curr_play',function() {
        vue_app.curr_play = true;
    })

    socket.on('set_prop',function(prop,val){
        vue_app[prop] = val;
    })

    // Listen for status events
    socket.on('status', function(data) {
        if (data.status == 'bid') {
            vue_app.curr_bid = data.bid.amount;
            vue_app.status_text = 'Your bid';
            if (typeof data.bid.amount == 'number')
                vue_app.status_text += ' - ' + data.bid.player + ' has it with ' + data.bid.amount
            vue_app.status = 'bidder';
        }
        else if (data.status == 'waiting') {
            vue_app.status_text = 'Waiting for ' + data.info.player + data.info.action;
        }
    });

    $('#message').keyup(function(e) {
        if (e.keyCode == 13)
            send_message();
    });
}

function send_message() {
    // after hitting send emit a “chat” event to our server with data containing our message and userName  
    socket.emit('chat', {
        message: message.value,
        username: username
    });
    message.value = '';
    setTimeout(function(){$('#messages').scrollTop($('#messages').height() + 100)},100);
}