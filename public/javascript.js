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
    $('.rssi').empty().append(data);
    console.log(data);

    var length = data.labels.length
    if (length >= 20) {
      data.datasets[0].data.shift()
      data.labels.shift()
    }
    
    data.labels.push(moment().format('HH:mm:ss'))
    data.datasets[0].data.push(value)
    chart.update()
  
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

var ctx = document.getElementById('chart').getContext('2d')

var data = {
  labels: [0],
  datasets: [{
    data: [0],
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
