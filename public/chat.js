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
        messages.innerHTML += '<p class="message-text"><strong>' + data + '</p></strong>';
    else
        messages.innerHTML += '<p class="message-text"><strong>' + data.username + ': </strong>' + data.message + '</p>';
    });

    // Used when the server wants to change a value in the vue app
    socket.on('set_prop',function(prop,val){
        vue_app[prop] = val;
    })

    socket.on('deal',function(hand){
        console.log(hand)
        vue_app.deal(hand);
    })


    // Listen for status events
    socket.on('status', function(data,bid) {
        if (bid) {
            vue_app.curr_bid = bid.amount;
            if (typeof bid.amount == 'number')
                vue_app.status_text += ' - ' + bid.player + ' has it with ' + bid.amount
            vue_app.status = 'bidder';
        }
        vue_app.status_text = data;
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
