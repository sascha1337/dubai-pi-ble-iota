// Connect to the server-side websockets. But there's no server yet!

var socket = io();

// When we receive a message
socket.on('message', function (msg) {
    console.log(msg);
});

socket.on('log', function (msg) {
    $('.log').append("<br>" + msg);
    console.log(msg);
})

socket.on('rssi', function (rssi) {
    $('.rssi').empty().append(rssi);
    console.log(rssi);

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
    console.log(msg);
})

$(function(){
    $.get("http://localhost:3000/device", function(data){
        console.log(data);
    });
});

var ctx = document.getElementById('chart').getContext('2d')

var data = {
  labels: [0],
  datasets: [{
    data: [0],
    yAxes: [{
        ticks: {
            beginAtZero: true
        }
    }],
    label: 'RSSI',
    backgroundColor: '#ff6600'
  }]
}

var optionsAnimations = { animation: false }

var chart = new Chart(ctx, {
  type: 'line',
  data: data,
  options: optionsAnimations
})

socket.on('temperature', function (value) {
})
