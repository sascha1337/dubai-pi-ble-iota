const socket_ctrl = require("./socket_controller");
const server = require('server');
const request = require("request");
const IOTA = require("iota.lib.js");
const iota = new IOTA({'provider': 'http://node.deviceproof.org:14265'});

var os = require( 'os' );
var ip = require('ip');

var axios = require("axios");

var _ = require("lodash");

// const device = require("./config");

function init(config){
    
    var networkInterfaces = os.networkInterfaces( );
    var myIp = ip.address();

    // console.log(networkInterfaces);
    // console.log(myIp);
    
    config.ip = myIp;
    config.networkInterfaces;

    const { get, post, error, socket } = server.router;
    const { render, json, status, header } = server.reply;
    const security =  { security: { csrf: false  } }

    const cors = [
        ctx => header("Access-Control-Allow-Origin", "*"),
        ctx => header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept"),
        ctx => ctx.method.toLowerCase() === 'options' ? 200 : false
      ];
      
    server(security, cors, [
        get('/', getDashboard),
        get('/socket_broadcast', testBroadcastIo),
        // get('/get_addr', getAddr),
        get('/device', getDeviceInfo),
        get('/device_list', getDeviceList),
        get("/prices", getPrices),
        get("/history", getHistoryJson),
        get("/getTxInfo", getTxInfo),
        // post('/maketx', ctx => {
        //     console.log(ctx.data);
        //     json(ctx.data)
        // }),
        socket('connect', socket_ctrl.connect),
        socket('message', socket_ctrl.message),
        socket('disconnect', socket_ctrl.disconnect),
        get(ctx => status(404)),
        error(ctx => status(500).send(ctx.error.message))
    ]);

    async function getHistoryJson(){
        var mox = await newHistory();
        return json({transactions:mox});
    }

    async function getTxInfo(ctx){
        console.log(ctx.query);
        var mox = await getTx(ctx.query.hash);
        return json(mox);
    }

    function getTx(hash) {
        return new Promise((resolve, reject) => {
            request.get("https://api.thetangle.org/transactions/" + hash, (a,b,c) => {
                try{
                    var xoxo = JSON.parse(c);
                    var strip = xoxo.signature.substr(0,xoxo.signature.indexOf("9"));
                    var datz = JSON.parse(iota.utils.fromTrytes(strip));
                    console.log(datz);
                    resolve(datz);

                }catch(ex){
                    console.log(hash,c);
                    resolve({});
                }
            });
        });

    }

    function newHistory() {
        return new Promise((resolve, reject) => {
            iota.api.findTransactionObjects({addresses:["9QVQIMAIVMDXMLTMGERL9UWKRG9LUAIRNOHRMVABPWARXJZHGMJCTTVCJAQATURWONRBJWDVIZVOZUPJCHZPEEURFZ"]},(err,txs) => {
                console.log(err);
                
                var filtered = _.orderBy(txs, ["timestamp"], ['desc']);
                var filter2 = _.uniqBy(filtered, 'bundle');
    
                var newTxArray = [];
    
                const mapz = filter2.map( tx => {
                    return new Promise((resolver, rejectr) => {
                        iota.api.getBundle(tx.hash, (errx,datz) => {
                            // console.log(errx,datz);
                            var res = JSON.parse(iota.utils.extractJson(datz));
                            // console.log(res);
                            newTxArray.push(Object.assign(tx, {data: res}));
                            resolver(res);
                        });
                    });
                });
    
                Promise.all(mapz).then(() => {
                    console.log(newTxArray);
                    resolve(newTxArray);
                }); 
    
            });
        
    
        });
    }

    function getHistory(){
        return new Promise((resolve, reject) => {
            request.get("https://api.thetangle.org/addresses/BJR9ZXCNLTAVBPJHEFCSQSVIAPXLUCTFATRMAUDGDORAXHNRPZJASDTUJCVVASCWP9KNWPZKPDLEGBWW9FLJPRYMCW",(a,b,c) => {
                if(!a){
                    var dat;
                    try {
                        dat = JSON.parse(c);
                        // dat.transactions.map((tx) => {
                        // });

                        var newTxArray = [];

                        dat.transactions.forEach(async (tx) => {
                            // console.log(tx.hash);
                            var resolved = await getTx(tx.hash);
                            tx.resolved = resolved;
                            newTxArray.push(Object.assign({}, tx, {data: resolved}));
                        });

                        // dat.transactions = newTxArray;

                        resolve(dat);
                        
                    } catch(ex) {
                        resolve();
                    }
                }else{
                    console.log("HISTORY ERROR");
                    resolve();
                }
            });

        });
    }

    
    function getIOTAprice(){
        return new Promise((resolve, reject) => {
            request.get("https://api.thetangle.org/market/prices",(a,b,c) => {
                if(!a){
                    // console.log(c);
                    var price;
                    try {
                        price = JSON.parse(c);
                        resolve(price);
                    } catch(ex) {
                        resolve({USD: 0.308});
                    }
                }else{
                    resolve()
                    console.log("ERROR THETANGLE PRICE");
                }
            });
        });
    }
    
    // function getAEDprice(){
    //     return new Promise((resolve, reject) => {
    //         request("https://free.currencyconverterapi.com/api/v6/convert?q=USD_AED&compact=ultra&apiKey=1ae8bd707d9b9d03751e",(a,b,c) => {
    //             if(!a){
    //                 console.log(c);
    //                 resolve(JSON.parse(c));
    //             }else{
    //                 console.log("ERROR AED PRICE");
    //                 resolve({"USD_AED": 3.67315});
    //             }
    //         });
    //     });
    // }
    
    async function getPrices(){
        var iotaprice = await getIOTAprice();
        // var aedprice = await getAEDprice();
        return json({iota_usd: iotaprice.USD, iota_aed: iotaprice.USD * 3.67, aed:3.67 });
    }
    
    function getDeviceInfo(){
        return json(config);
    }

    function getDeviceList(){
        var station = require("./config_parking.json");
        var car = require("./config_car.json");
        var gov = require("./config_gov.json");
        return json({car,station,gov});
    }
    
    async function getDashboard(ctx){
        var prices = await getPrices();
        return render('index.hbs', {device:config, prices});
    }
    
    function testBroadcastIo(ctx){
        socket_ctrl.broadcast("test");
        // if(socket_ctrl.io)
        //     socket_ctrl.io.emit("message","happening to all");
        // else
        //     console.log("::SOCKET:: no io found");
        return "ok";
    }

    /* 
        dynamic new seed code ( obsolete atm ) 
        const iotaSeed = require('iota-seed')
        let seed = iotaSeed() // <- This is you IOTA seed
    */
    
    // var carSeed = "SPWYYQ9FMNIPBEGIXYAIYTDNLKOVQKNFNLUHUPNRMQLUCDRZXMANACKWAKKMYTGWRDSYK9YUTAQTMYBXZ"; // empty yet
    // var lotSeed = "OJBNQMRJLCOJEFTPPPCZMOXDVMPLHNDOLHWDXMNIAQMFFXY9EIVEHPPIRKNKTOPMYQWWIFJZHUPDQZZKS"; // empty yet
    

}


module.exports.init = init;