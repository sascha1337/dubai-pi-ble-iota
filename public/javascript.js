var device;
var device_list;

var socket_car;
var socket_gov;
var socket_station;
var socket;

var ust_to_aed = 3.67250;
var kf = new KalmanFilter({R: 0.8, Q: 20});

// broadcast_status({type:"parking_start"});
// broadcast_status({type:"parking_duration", parkingSeconds
// broadcast_status({type:"parking_done", duration, cost });

function setup_sockets(){
    
    // When we receive a message
    socket_station.on('message', function (msg) {
        console.log(msg);
    });

    socket_station.on('log', function (msg) {
        $('.log').append(msg);
        console.log(msg);
    })

    socket_station.on('realtime', function(msg){
        $(".realtime").empty().append(msg);
    });

    socket_station.on('rssi', function (rssi) {
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

    socket_station.on('status', function (msg) {
        // $('.status').empty().append(msg);
        console.log(":::status:::", msg);

        if(msg.type == "parking_start"){
            $(".status_car").empty().append("*PARKING*")
            $(".status_parking").empty().append("*CAR PARKING*")
        }

        if(msg.type == "parking_duration"){
            $(".parking_duration").empty().append(msg.parkingSeconds);
        }

        if(msg.type == "parking_done"){
            $(".status_car").empty().append("DRIVING")
            $(".status_parking").empty().append("Not Occupied")
        }

    })
}

var prices = {
    aed: 3.67,
    iota_aed: 1.128323517,
    iota_usd: 0.3074451
};

$(function(){

    $.get("http://localhost:3000/device", function(data) {

        console.log("DEVICE:", data);
        device = data;

        $.get("http://localhost:3000/device_list", function(list){
            
            console.log("DEVICE LIST:", list);
            device_list = list;
            
            // socket_car = io("http://" + device_list.car.zerotier_ip_dev + ":3000");
            socket_station = io("http://" + device_list.station.zerotier_ip_dev + ":3000");
            // socket_gov = io("http://" + device_list.gov.zerotier_ip_dev + ":3000");
            
            setup_sockets();

            // if(device.car){
            //     socket_car = io("http://" + device_list.car.zerotier_ip_dev + ":3000");
            //     socket_station = io("http://" + device_list.station.zerotier_ip_dev + ":3000");
            //     socket_gov = io("http://" + device_list.gov.zerotier_ip_dev + ":3000");
            // }
            
            // if(device.station){
            // }

            // if(device.gov){
            //     socket_gov = io("http://" + device_list.gov.zerotier_ip_dev + ":3000");
            // }
        });
    });


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
    lineTension: 0.15,
    borderColor:"rgba(202, 77, 213, 1)", // The main line color
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
