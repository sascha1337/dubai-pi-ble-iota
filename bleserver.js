var bleno = require('bleno');

var name = 'IOTA Dubai M2M parking';
var serviceUuids = ['fffffffffffffffffffffffffffffff0']

// bleno.startAdvertising(name, serviceUuids, error);


bleno.on('stateChange', function(state) {
    console.log('on -> stateChange: ' + state);
  
    if (state === 'poweredOn') {
      bleno.startAdvertising(name, serviceUuids);
      console.log("emitting");
    } else {
      bleno.stopAdvertising();
    }
  });
  
  bleno.on('advertisingStart', function(error) {
      
    console.log('on -> advertisingStart: ' + (error ? 'error ' + error : 'success'));
  
    if (!error) {
        console.log("no err");
        // bleno.setServices([
        //     new SampleService()
        // ]);
    }
  });
  
  bleno.on('advertisingStop', function() {
    console.log('on -> advertisingStop');
  });
  

function error(err) {
    console.error(err);
}