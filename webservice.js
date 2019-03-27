const IOTA = require("iota.lib.js");
const server = require('server');

const socket_ctrl = require("./socket_controller");
// const device = require("./config");

// Communication channel with ESP32
const { get, post, error, socket } = server.router;
const { render, json, status } = server.reply;
const security =  { security: { csrf: false  } }

server(security, [
    get('/', getDashboard),
    get('/socket_broadcast', testBroadcastIo),
    get('/lotaddr', getAddr),
    get('/device', getDeviceInfo),
    post('/maketx', ctx => {
        console.log(ctx.data);
        json(ctx.data)
    }),
    socket('connect', socket_ctrl.connect),
    socket('message', socket_ctrl.message),
    socket('disconnect', socket_ctrl.disconnect),
    get(ctx => status(404)),
    error(ctx => status(500).send(ctx.error.message))
]);


function getDeviceInfo(){
    return device;
}

function getDashboard(ctx){
    return render('index.hbs', {device:{abc:123}});
}

function testBroadcastIo(ctx){
    socket_ctrl.broadcast("test");
    // if(socket_ctrl.io)
    //     socket_ctrl.io.emit("message","happening to all");
    // else
    //     console.log("::SOCKET:: no io found");
    return "ok";
}


function getAddr(ctx){
    return new Promise((resolve, reject) => {
        // get addr for lot
        iota.api.getNewAddress(lotSeed, {}, (err, addr) => {
            if(!err){
                // currentStatusThree = addr;
                resolve({addr});
            }else{
                resolve({err:"addr err"});
            }
        });
    })    
}

function makeTx(ctx) {

    return new Promise((resolve, reject) => {

        var {addr, duration, cost} = ctx.data;
        
        var msg = { "device": "smart_parkinglot_dubai_1", "type": "parking_fee", "duration": duration.asSeconds(), "cost": cost, "timestamp": new Date().toString() };
        var transfers = [{address: addr, message: iota.utils.toTrytes(JSON.stringify(msg)), value: cost, tag: "AKITA9PARKING9IOTA" }];

        iota.api.sendTransfer(carSeed, 3, 14, transfers, (err,dat) => {
        
            if(!err) {
                console.log(dat);
                currentStatusThree = "Transaction with TAG AKITA9PARKING sent !";
                json(currentStatusThree);
            }else{
                console.log("ERROR:", err);
                currentStatusThree = "Transaction with TAG AKITA9PARKING sent !e";
                json(currentStatusThree);
            }
        });
    });
   
}


// Create IOTA instance directly with provider
var iota = new IOTA({
    'provider': 'https://nodes.thetangle.org:443'
});

/* 
    dynamic new seed code ( obsolete atm ) 
    const iotaSeed = require('iota-seed')
    let seed = iotaSeed() // <- This is you IOTA seed
*/

var carSeed = "SPWYYQ9FMNIPBEGIXYAIYTDNLKOVQKNFNLUHUPNRMQLUCDRZXMANACKWAKKMYTGWRDSYK9YUTAQTMYBXZ"; // empty yet
var lotSeed = "OJBNQMRJLCOJEFTPPPCZMOXDVMPLHNDOLHWDXMNIAQMFFXY9EIVEHPPIRKNKTOPMYQWWIFJZHUPDQZZKS"; // empty yet

// now you can start using all of the functions
iota.api.getNodeInfo(function(error, success) {
    if (error) {
        console.error(error);
    } else {
        // console.log(success)
        console.log("::IOTA::","node connected");
    }
});
