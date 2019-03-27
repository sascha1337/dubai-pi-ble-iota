var config = require("./config_car.json");

var webservice = require("./webservice");
var blescanner = require("./blescanner");

blescanner.init();

// curl --header "Content-Type: application/json" --request POST --data '{"username":"xyz","password":"xyz"}' http://mbpro.local:3000/maketx
