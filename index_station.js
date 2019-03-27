var config = require("./config_parking.json");
process.env['BLENO_DEVICE_NAME'] = config.ble_name;

var webservice = require("./webservice");
var bleserver = require("./bleserver");

bleserver.init();
webservice.init(config);

// curl --header "Content-Type: application/json" --request POST --data '{"username":"xyz","password":"xyz"}' http://mbpro.local:3000/maketx