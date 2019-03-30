var kf = new KalmanFilter({R: 0.8, Q: 15});

var socket = io();
var ust_to_aed = 3.67250;

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

    /* KALMAN RSSI */

    var length = data.labels.length

    if (length >= 20) {
      data.datasets[0].data.shift()
      data.datasets[1].data.shift()
      data.labels.shift()
    }

    data.labels.push(moment().format('HH:mm:ss'))

    data.datasets[1].data.push(rssi)
    data.datasets[0].data.push(kf.filter(rssi))

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
    label: 'KALMAN',
    fill: false,
    lineTension: 0.1,
    backgroundColor: "rgba(202, 77, 213, 1)",
    borderColor: "red", // The main line color
    borderCapStyle: 'square',
    borderDash: [], // try [5, 15] for instance
    borderDashOffset: 0.0,
    borderJoinStyle: 'miter',
    pointBorderColor: "black",
    pointBackgroundColor: "white",
    pointBorderWidth: 1,
    pointHoverRadius: 8,
    pointHoverBackgroundColor: "yellow",
    pointHoverBorderColor: "brown",
    pointHoverBorderWidth: 2,
    pointRadius: 4,
    pointHitRadius: 10,

    backgroundColor: "rgba(202, 77, 213, 1)"
  },
  {
    data: [0],
    label: 'RSSI',
    // fill: false,
    backgroundColor: "rgba(255, 102, 0, 0.9)"
  },]
}

var optionsAnimations = { 
    animation: false,
    scales:{
        yAxes: [{
            ticks: {
                beginAtZero: true,
                // max: -80
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
