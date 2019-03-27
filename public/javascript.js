// Connect to the server-side websockets. But there's no server yet!

var socket = io();

// When we receive a message
socket.on('message', function (data) {
    console.log(data);
});

$(function(){
    $.get("http://localhost:3000/device", function(data){
        console.log(data);
    });
});