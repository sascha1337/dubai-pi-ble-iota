// Connect to the server-side websockets. But there's no server yet!

var socket = io();

// When we receive a message
socket.on('message', function (data) {
    console.log(data);
});

socket.on('log', function (data) {
    $('.log').append("<br>" + data);
    console.log(data);
})

socket.on('rssi', function (data) {
    $('.log').empty().append(data);
    console.log(data);
})

socket.on('status', function (data) {
    $('.status').empty().append(data);
    console.log(data);
})

$(function(){
    $.get("http://localhost:3000/device", function(data){
        console.log(data);
    });
});