
var device;
var device_list;

var socket_car;
var socket_gov;
var socket_station;
var socket;

var ust_to_aed = 3.67250;
var kf = new KalmanFilter({R: 0.8, Q: 5});

var car_balance_aed = 1000;
var station_balance_aed = 0;

// broadcast_status({type:"parking_start"});
// broadcast_status({type:"parking_duration", parkingSeconds
// broadcast_status({type:"parking_done", duration, cost });

setInterval(() => {
    $(".stamper").each((i,dat) => {
        var check = $(dat).data("stamp");
        if(check)
            $(dat).html(moment.unix($(dat).data("stamp")).fromNow());
    });
},3000);

function wrapRipple(msg){
    return '<div class="lds-ripple float-left"><div></div><div></div></div> ' + msg + ' <div class="lds-ripple float-right"><div></div><div></div></div>';
}

function wrapLi(duration,cost,hash, timestamp) {
    return '<li class="list-group-item d-flex justify-content-between align-items-center"><span>Duration: ' + duration + ' seconds</span> <span data-stamp="' + timestamp + '" class="stamper">' + moment.unix(timestamp).fromNow() + '</span> <small class="mute"><a target="_blank" href="https://thetangle.org/transaction/' + hash + '">' + hash.substr(0,30) + '...</a></small><span class="badge badge-primary badge-pill float-right">' + cost + ' IOTA</span></li>';
}

function wrapLiPending(duration,cost) {
    return '<li class="list-group-item d-flex justify-content-between align-items-center"><span>Duration: ' + duration + ' seconds</span> <span data-stamp="" class="stamper myago"></span> <small class="mute"><a target="_blank" class="tx_pending" href="https://thetangle.org/transaction/">' + wrapRipple("pending...") + '...</a></small><span class="badge badge-primary badge-pill float-right">' + cost + ' IOTA</span></li>';
}

function getHistory(){
    
    $.get("http://"  + document.domain + ":3000/history", (dat) => {
        console.log("HISTORY", dat);

        dat.transactions.sort(function(x, y){
            return x.timestamp - y.timestamp;
        })

        dat.transactions.forEach(tx => {
            // if(tx.status !== "reattachmentConfirmed")
            $(".history").prepend(wrapLi(tx.data.duration,tx.data.cost,tx.hash, tx.timestamp));
        });
    });
}

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

    socket_station.on('tx', (data) => {
        
        console.log(data);
        $(".history").prepend(wrapLi(data.duration,data.cost,data.tx[0].hash, data.tx[0].timestamp));

    });
    
    socket_station.on('status', function (msg) {
        // $('.status').empty().append(msg);
        
        if(msg.type == "parking_start") {
            console.log(":::parking_start:::", msg);
            $(".status_car").empty().append(wrapRipple("Status: Parking")).css("color","lime");
            $(".status_parking").empty().append(wrapRipple("Car is parking")).css("color","lime");
        }

        if(msg.type == "parking_duration"){
            $(".parking_duration").empty().append(hhmmss(msg.parkingSeconds));
        }
        
        if(msg.type == "tx_done"){
            console.log("TX DONE", msg);
            $(".tx_pending").html(msg.tx[0].hash.substr(0,30)).attr("href","https://thetangle.org/transaction/" + msg.tx[0].hash);
            $(".tx_pending").removeClass("tx_pending");
            
            $(".myago").html(moment.unix(msg.tx[0].timestamp).fromNow());
            $(".myago").data("stamp",msg.tx[0].timestamp);

            $(".myago").removeClass("myago")
        }

        if(msg.type == "parking_done"){

            console.log(":::parking_done:::", msg);

            $(".status_car").empty().append("Status: Driving").css("color","orange");
            $(".status_parking").empty().append("<i>Not occupied</i>").css("color","orange");
            $(".realtime").empty().append("idle");

            if(device.car){

                var x = car_balance_aed - (msg.duration);
                car_balance_aed = x;

                $(".balance_aed").empty().append(car_balance_aed.toFixed(2));
                
                var new_usd_balance = (car_balance_aed * 0.27);
                var new_iota_balance = new_usd_balance * 3.2711;

                $(".balance_iota").empty().append(new_iota_balance.toFixed(2));
                $(".balance_usd").empty().append(new_usd_balance.toFixed(2));

            }

            if(device.station) {

                var x = station_balance_aed + (msg.duration);
                station_balance_aed = x;
                $(".balance_aed").empty().append(station_balance_aed.toFixed(2));
                
                var new_usd_balance = (station_balance_aed * 0.27);
                var new_iota_balance = new_usd_balance * 3.2711;

                $(".balance_iota").empty().append(new_iota_balance.toFixed(2));
                $(".balance_usd").empty().append(new_usd_balance.toFixed(2));
            }

            $(".history").prepend(wrapLiPending(msg.duration,msg.duration));

            setTimeout(function(){
                $(".parking_duration").empty().append(hhmmss(0));
                // balance and ui update 
            }, 3000);
            
        }
    })
}

var prices = {
    aed: 3.67,
    iota_aed: 1.128323517,
    iota_usd: 0.3074451
};

$(function(){

    $.get("http://" + document.domain + ":3000/device", function(data) {

        console.log("DEVICE:", data);
        device = data;

        if(device.car){

            var x = car_balance_aed;
            car_balance_aed = x;
        
            $(".balance_aed").empty().append(car_balance_aed.toFixed(2));
            
            var new_usd_balance = (car_balance_aed * 0.27);
            var new_iota_balance = new_usd_balance * 3.2711;
        
            $(".balance_iota").empty().append(new_iota_balance.toFixed(2));
            $(".balance_usd").empty().append(new_usd_balance.toFixed(2));
        
        }
        
        if(device.station) {
        
            var x = station_balance_aed;
            station_balance_aed = x;
            $(".balance_aed").empty().append(station_balance_aed.toFixed(2));
            
            var new_usd_balance = (station_balance_aed * 0.27);
            var new_iota_balance = new_usd_balance * 3.2711;
        
            $(".balance_iota").empty().append(new_iota_balance.toFixed(2));
            $(".balance_usd").empty().append(new_usd_balance.toFixed(2));
        }

        $.get("http://" + document.domain + ":3000/device_list", function(list){
            
            console.log("DEVICE LIST:", list);
            device_list = list;
            
            // socket_car = io("http://" + device_list.car.zerotier_ip_dev + ":3000");
            socket_station = io("http://" + device_list.station.zerotier_ip + ":3000");
            // socket_gov = io("http://" + device_list.gov.zerotier_ip_dev + ":3000");
            
            setup_sockets();
            getHistory();
            
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
    
    setInterval(function() {
        // console.log("fetch prices");
        $.get("http://" + document.domain + ":3000/prices", function(data){
            // console.log(data);
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


function pad(num) {
    return ("0"+num).slice(-2);
}

function hhmmss(secs) {
  var minutes = Math.floor(secs / 60);
  secs = secs%60;
  var hours = Math.floor(minutes/60)
  minutes = minutes%60;
  return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
  // return pad(hours)+":"+pad(minutes)+":"+pad(secs); for old browsers
}