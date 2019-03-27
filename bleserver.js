var bleno = require('bleno');
var device = require("./config").device;

function init(){

    console.log("--------AKITA M2M --------");
    console.log(device);
    console.log("--------------------------");
    
    bleno.on('stateChange', function(state) {
        console.log('::BLE:: new state: ' + state);
        if (state === 'poweredOn') {
          bleno.startAdvertising(device.ble_name, [device.ble_uuid]);
        } else {
          bleno.stopAdvertising();
        }
    });
      
    bleno.on('advertisingStart', function(error) {
        if (!error) {
            console.log("::BLE:: started advertising as", device.ble_name)
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