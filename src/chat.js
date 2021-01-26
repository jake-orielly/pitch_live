
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
