function chat_setup() {
    var messages; 
    // Listen for chat events
    socket.on('chat', function(data) {
        if (!messages)
            messages = document.getElementById('messages');
        // When we receive a “chat” event, display the message to the user
        if (typeof data == 'string')
            messages.innerHTML += '<p class="message-text"><strong>' + data + '</p></strong>';
        else
            messages.innerHTML += '<p class="message-text"><strong>' + data.username + ': </strong>' + data.message + '</p>';
        var objDiv = document.getElementById("messages");
        setTimeout(function(){objDiv.scrollTop = objDiv.scrollHeight;});
    });

    // Used when the server wants to change a value in the vue app
    socket.on('set_prop',function(prop,val,is_JSON=false){
        if (is_JSON)
            val = JSON.parse(val);
        console.log(prop,val);
        vue_app[prop] = val;
    })

    socket.on('deal',function(hand){
        console.log(hand)
        vue_app.deal(hand);
    })

    socket.on('played',function(data){
        vue_app.other_played(data);
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
    var objDiv = document.getElementById("messages");
    setTimeout(function(){objDiv.scrollTop = objDiv.scrollHeight;});
}
