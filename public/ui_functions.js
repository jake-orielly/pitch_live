var username, socket;
var io = io();

$('#username-confirm').click(function() {
    var sendBtn;
    let chat_load_wait; 
    socket = io.connect('http://localhost:3000');
    vue_app.socket = socket;
    vue_app.signed_in = true;
    username = $('#username-input').val()
    vue_app.username = username
    chat_setup();
    $('#username-container').hide();
    socket.emit('username_submission',{
        username_submission: username
    });

    chat_load_wait = setInterval(function(){
        sendBtn = document.getElementById('send');
        if (sendBtn) {
            sendBtn.addEventListener('click', function() {
                send_message();
            });
            clearInterval(chat_load_wait);
        }
    },50);
});