var username, socket;
var io = io();
$('#username-confirm').click(function() {
    socket = io.connect('http://localhost:3000');
    vue_app.socket = socket;
    chat_setup();
    username = $('#username-input').val()
    $('#username-container').hide();
    socket.emit('username_submission',{
        username_submission: username
    });
});

$('#deal-button').click(function(){
    socket.emit('ready_signal', {
        staus: 'ready'
    });
})