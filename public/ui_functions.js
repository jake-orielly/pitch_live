var username = 'Jake';

$('#username-confirm').click(function() {
    username = $('#username-input').val()
    $('#username-container').hide();
    socket.emit("username_submission",{
        username: username
    });
});

$('#deal-button').click(function(){
    socket.emit("ready_signal", {
        staus: "ready"
    });
})