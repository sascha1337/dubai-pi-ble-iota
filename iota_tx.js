const IOTA = require("iota.lib.js");

// Create IOTA instance directly with provider
var iota = new IOTA({
    'provider': 'https://nodes.thetangle.org:443'
});

var tax_addr = "LCCAVFIIVLWVSVSMXYWWSNZGRLGWVMPYYOLKYJAOLBDFVPBSYIRAPIBQDOOOJKDYJVWOLTTLLCQGMRAE9WKKXCTZTA";
var cached_parking_addr = "";

setTimeout(() => {
    nodeInfo();
},3000);

function nodeInfo(){
    return new Promise((resolve, reject) => {
        iota.api.getNodeInfo(function(error, success) {
            if (error) {
                console.error(error);
            } else {
                console.log("::IOTA::","node connected");
                resolve(success);
            }
        });

    });
}

function getAddr(seed){
    return new Promise((resolve, reject) => {
        // get addr for lot
        iota.api.getNewAddress(seed, {}, (err, addr) => {
            if(!err){
                // currentStatusThree = addr;
                cached_parking_addr = addr;
                resolve({addr});
            }else{
                console.log(err);
                resolve({err});
            }
        });
    })    
}

function percent(num, amount){
    return num*amount/100;
}

function getBalance(seed) {
    return new Promise((resolve, reject) => {
        iota.api.getInputs(seed, (err, data) => {
            console.log(err,data);
            resolve(data);
        });
    });
}

function makeTx(seed, addr, duration, cost) {
    return new Promise((resolve, reject) => {

        var tax_amount = Math.round(percent(cost, 5));

        var parking_tx = { "device": "smart_parkinglot_dubai_1", "type": "parking_fee", "duration": duration, "cost": cost, "timestamp": new Date().toString() };
        var tax_tx = {type:"tax", invoice_amount: cost, tax_amount, "from":"smart_parkinglot_dubai_1", "timestamp": new Date().toString() };

        var transfers = [
            {address: addr, message: iota.utils.toTrytes(JSON.stringify(parking_tx)), value: cost, tag: "AKITA9DUBAI9CAR" },
            {address: tax_addr, message: iota.utils.toTrytes(JSON.stringify(tax_tx)), value: tax_amount, tag: "AKITA9DUBAI9TAX" }
        ];

        iota.api.sendTransfer(seed, 3, 14, transfers, (err,dat) => {
            if(!err) {
                console.log("::IOTA:: TX sent");
                console.log(dat.bundle[0].hash);
                resolve(dat);
            } else {
                console.log("ERROR:", err);
                reject(err);
            }
        });
    });
}

module.exports.makeTx = makeTx;
module.exports.getAddr = getAddr;
module.exports.getBalance = getBalance;
module.exports.cached_parking_addr = cached_parking_addr;
