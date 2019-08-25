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
        if ($('#send')) {
            $('#send').click(send_message);
            $('#message').on('keyup', function (e) {
                console.log(e.keycode)
                if (e.keyCode === 13) 
                    send_message();
            });
            clearInterval(chat_load_wait);
        }
    },50);
});