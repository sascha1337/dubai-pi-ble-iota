// Connect to the server-side websockets. But there's no server yet!

var ust_to_aed = 3.67250;

var socket = io();

// When we receive a message
socket.on('message', function (msg) {
    console.log(msg);
});

socket.on('log', function (msg) {
    $('.log').append(msg);
    console.log(msg);
})

socket.on('realtime', function(msg){
    $(".realtime").empty().append(msg);
});

socket.on('rssi', function (rssi) {
    $('.rssi').empty().append(rssi);
    $('.rssi2').empty().append(rssi);
    // console.log(rssi);

    var length = data.labels.length
    if (length >= 20) {
      data.datasets[0].data.shift()
      data.labels.shift()
    }

    data.labels.push(moment().format('HH:mm:ss'))
    data.datasets[0].data.push(rssi)
    chart.update()
  
})

socket.on('status', function (msg) {
    $('.status').empty().append(msg);
    // console.log(msg);
})

var prices = {
    aed: 3.67,
    iota_aed: 1.128323517,
    iota_usd: 0.3074451
};

$(function(){
    setInterval(function(){
        // console.log("fetch prices");
        $.get("http://localhost:3000/prices", function(data){
            console.log(data);
            prices = data;
        });
    }, 60000);
});


var ctx = document.getElementById('chart').getContext('2d')

var data = {
  labels: [0],
  datasets: [{
    data: [0],
    label: 'RSSI',
    backgroundColor: '#ff6600'
  }]
}

var optionsAnimations = { 
    animation: true,
    scales:{
        yAxes: [{
            ticks: {
                beginAtZero: true
            }
        }]
    }
}

var chart = new Chart(ctx, {
  type: 'line',
  data: data,
  options: optionsAnimations
})

socket.on('temperature', function (value) {
})
