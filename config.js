var config = require("./config.json");
var device = {};

switch (config.mode) {
    case "device_car":
        device = config.device_car;
        process.env['BLENO_DEVICE_NAME'] = config.device_car.ble_name;
        break;

    case "device_parking":
        device = config.device_parking;
        process.env['BLENO_DEVICE_NAME'] = config.device_parking.ble_name;
        break;
    default:
        console.error("MODE ERROR; CHECK CONFIG");
        break;
}

exports.device = device;
exports.fullConfig = config;