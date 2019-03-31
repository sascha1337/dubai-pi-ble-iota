var device_car = require("./config_car.json");
var device_parking = require("./config_parking.json");

var noble = require('noble');
var moment = require("moment");
var KalmanFilter = require('kalmanjs')

var socket_ctrl = require("./socket_controller");
var iota_ctrl = require("./iota_tx");

var scanningTimeout = 1000; // one second
var scanningRepeat = scanningTimeout; // Repeat scanning after 10 seconds for new peripherals.

var myBalance = 10000;
var lotBalance;

var isParking = false;

var currentStatus = "Waiting for car to park at smart lot";
var currentStatusTwo = "";
var currentStatusThree = "";

var parkingSeconds;
var intervalOne;

var now ;//= moment(new Date()); //todays date
var end; // = moment(new Date()); // another date

const axios = require('axios')

var txprocessor = "http://13.67.54.253";

var kf = new KalmanFilter({R: 0.8, Q: 20});


function init(){

    noble.on('stateChange', function(state) {
        if (state === 'poweredOn') {
          console.log("::BLE::","poweredOn")
          
          // iota_ctrl.getAddr(device_parking.iota_wallet_seed).then((dat) => {
          //   console.log("::IOTA ADDR::", dat);
          // });

          // iota_ctrl.getBalance(device_car.iota_wallet_seed).then((dat) => {
          //   console.log("::IOTA BAL::", dat.totalBalance);
          // });

          noble.startScanning();
        } else {  
          console.log("::BLE::","stoppedScan")
          noble.stopScanning();
        }
      })
      
      
      // Checking, Scanning, stopping repeatedly
      setInterval( function(){
        if(noble.state==='poweredOn') {
            noble.startScanning();
            // console.log('Starting Scan...');
            setTimeout(function(){
              noble.stopScanning();
              // console.log('Stopping Scan...');
            }, scanningTimeout)
        }
      }, scanningRepeat);
      
      noble.on('discover', function(peripheral) {
      
        var advertisement = peripheral.advertisement;
        var localName = advertisement.localName;
        var txPowerLevel = advertisement.txPowerLevel;
        var manufacturerData = advertisement.manufacturerData;
        var serviceData = advertisement.serviceData;
        var serviceUuids = advertisement.serviceUuids;
        
        if(localName == device_car.ble_name) {
          
          // console.log("::BLE::", localName, "->", peripheral.rssi);
          socket_ctrl.broadcast_rssi(peripheral.rssi)
          
          var rssi = peripheral.rssi;
          var conn = peripheral.state;
      
          // process.stdout.write("# " + rssi + " ");

          var filtered_rssi = kf.filter(rssi);
          
          if(conn === "disconnected" && !isParking && filtered_rssi > device_parking.parking_rssi_start) {

            socket_ctrl.broadcast_status({type:"parking_start", addr: iota_ctrl.cached_parking_addr});
            
            parkingSeconds = 0;
            isParking = true;
            
            currentStatus = "### Car is parking " + parkingSeconds.toString() + " seconds...";
            currentStatusTwo = "";
            currentStatusThree = "";

            socket_ctrl.broadcast_realtime("IOTA ADDR: " + iota_ctrl.cached_parking_addr);
            
            now = moment(new Date()); //todays date

            // bufferOut();
      
            intervalOne = setInterval(function () {
              if(isParking){
                
                parkingSeconds++;
                currentStatus = "### Car is parking " + parkingSeconds.toString() + " seconds...";
                socket_ctrl.broadcast_realtime("### Car is parking " + parkingSeconds.toString() + " seconds...")
                socket_ctrl.broadcast_status({type:"parking_duration", parkingSeconds });

                // bufferOut();
              }else{
                clearInterval(intervalOne);
              }
            }, 1000);
      
          }
      
          if(conn === "disconnected"  && isParking && filtered_rssi < device_parking.parking_rssi_end) {
            if(intervalOne) clearInterval(intervalOne);

            isParking = false;
            end = moment(new Date()); // another date

            var duration = Math.round(moment.duration(end.diff(now)).asSeconds());
            var cost = duration;

            // console.log("### Parking stopped, executing IOTA payment");
            // console.log("### Car stopped parking");
            // console.log("-> duration: " + Math.round(duration.asSeconds()) + " seconds");
            // console.log("-> sended iOTA: " + cost + " i");
            
            myBalance = myBalance - cost;
            
            socket_ctrl.broadcast_status({type:"parking_done", duration, cost });
            socket_ctrl.broadcast_realtime("### STOPPED -> duration: " + duration + " seconds")


            createTx(duration,cost);

            // currentStatus = "Car stopped parking";
            // currentStatusTwo = "Parking duration: " + Math.round(duration.asSeconds()) + " seconds";
            // currentStatusThree = "Preparing " + cost + " iOTA transfer to parking lot ...";
      
            // console.log("Updated Balance: " + myBalance )
            // bufferOut();

            // makeTx(duration,cost);
          }
        }
    }); // End on Noble Discover!

    function createTx(duration,cost) {
      
      axios.post(txprocessor + "/maketx", {
        duration,
        cost
      })
      .then((res) => {
        console.log(`statusCode: ${res.statusCode}`)
        console.log(res.data)
      })
      .catch((error) => {
        console.error(error)
      })

    }
    
}


module.exports.init = init;