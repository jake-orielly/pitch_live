function chat_setup() {
    // get dom elements
    var sendBtn = document.getElementById("send");
    var messages = document.getElementById("messages");

    // add click listener to our button
    sendBtn.addEventListener("click", function() {
        send_message();
    });

    // Listen for chat events
    socket.on("chat", function(data) {
    // When we receive a “chat” event, display the message to the user
    if (data.status_message)
        messages.innerHTML += "<p><strong>" + data.username + " " + data.message + "</p></strong>";
    else
        messages.innerHTML += "<p><strong>" + data.username + ": </strong>" + data.message + "</p>";
    });

    // Listen for deal events
    socket.on("deal", function(data) {
        vue_app.hand = data;
    });

    $("#message").keyup(function(e) {
        if (e.keyCode == 13)
            send_message();
    });
}

function send_message() {
    // after hitting send emit a “chat” event to our server with data containing our message and userName  
    socket.emit("chat", {
        message: message.value,
        username: username
    });
    message.value = "";
    setTimeout(function(){$("#messages").scrollTop($("#messages").height() + 100)},100);
}