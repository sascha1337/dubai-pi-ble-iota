var bleno = require('bleno');
var device = require("./config_parking.json");

function init(config){
        

    console.log("--------AKITA M2M BLE --------");
    console.log(config);
    console.log("--------------------------");
    
    bleno.on('stateChange', function(state) {

        console.log('::BLE:: new state: ' + state);
        if (state === 'poweredOn') {
          bleno.startAdvertising(config.ble_name, [config.ble_uuid]);
        } else {
          bleno.stopAdvertising();
        }

    });
      
    bleno.on('advertisingStart', function(error) {
        if (!error) {
            console.log("::BLE:: started advertising as", config.ble_name)
            // bleno.setServices([
            //     new SampleService()
            // ]);
        }else{
            console.error(error);
        }
    });
    
    bleno.on('advertisingStop', function() {
        console.log('::BLE:: advertisingStop');
    });
}


exports.init = init;
exports.bleno = bleno;