var username, socket;
var io = io();

$('#username-input').keyup(function(e) {
    if (e.key == 'Enter')
        submitUsername();
});

$('#username-confirm').click(submitUsername);

$("#login-form, #create-account").submit(function(e) {
    e.preventDefault();
});

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

$('#test-request').click(login);
$('#create-account').click(create_account);

function login(){
    const Http = new XMLHttpRequest();
    let username = $('#username-input').val();
    let password = $('#password-input').val();
    const url=`http://23.254.164.217:8000/login?user=${username}&password=${password}`;
    Http.open("POST", url);
    Http.send();

    Http.onreadystatechange = (e) => {
        if (Http.readyState == 4) {
            var result = JSON.parse(Http.responseText)
            vue_app.login_status = result.message;
        }
    }
}

function create_account(){
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
                vue_app.signup_status = result.message;
            else if (result.error)
                vue_app.signup_status = 'Error: ' + result.error;
            else
                vue_app.signup_status = 'Error: Uknown Error';
        }
    }
}