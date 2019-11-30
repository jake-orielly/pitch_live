var username, socket;
var io = io();

$('#username-input').keyup(function(e) {
    if (e.key == 'Enter')
        submitUsername();
});

$('#username-confirm').click(submitUsername);

function submitUsername() {
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
    },50)
}

$('#test-request').click(checkAlive);

function checkAlive(){
    const Http = new XMLHttpRequest();
    let username = $('#username-input').val()
    const url='http://23.254.164.217:8000/user_exists?name=' + username;
    Http.open("GET", url);
    Http.send();

    Http.onreadystatechange = (e) => {
        if (Http.readyState == 4)
            console.log(Http.responseText)
    }
}