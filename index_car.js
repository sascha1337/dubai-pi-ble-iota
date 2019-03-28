var config = require("./config_car.json");
process.env['BLENO_DEVICE_NAME'] = config.ble_name;

var webservice = require("./webservice");
// var blescanner = require("./blescanner");
var bleserver = require("./bleserver");

// blescanner.init(config);
bleserver.init(config);
webservice.init(config);

// curl --header "Content-Type: application/json" --request POST --data '{"username":"xyz","password":"xyz"}' http://mbpro.local:3000/maketx