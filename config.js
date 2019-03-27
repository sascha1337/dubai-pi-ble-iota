var config = require("./config.json");
var device = {};

switch (config.mode) {
    case "device_car":
        device = config.device_car;
        break;

    case "device_parking":
        device = config.device_parking;
        break;

    default:
        console.error("MODE ERROR; CHECK CONFIG");
        break;
}

exports.device = device;
exports.fullConfig = config;