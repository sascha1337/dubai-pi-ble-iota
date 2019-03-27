var config = require("./config_parking.json");
process.env['BLENO_DEVICE_NAME'] = env.ble_name;

var webservice = require("./webservice");
var bleserver = require("./bleserver");
bleserver.init();

// curl --header "Content-Type: application/json" --request POST --data '{"username":"xyz","password":"xyz"}' http://mbpro.local:3000/maketx