// socket('connect', ctrl.connect),
// socket('message', ctrl.message),
// socket('disconnect', ctrl.disconnect),

var io;

function connect(ctx){
    console.log("::SOCKET::", "interface connected");
    io = ctx.io;
}

function message(ctx){
    console.log("::SOCKET_MSG::", ctx.data);
    ctx.socket.emit("message", ctx.data);
}

function disconnect(ctx){
    // console.log(ctx);
    console.log("::SOCKET_MSG::", "interface disconnected");
}

function broadcast(dat){
    io.emit("message",dat);
}

function broadcast_log(dat){
    io.emit("log",dat);
}

function broadcast_status(dat){
    io.emit("status",dat);
}

function broadcast_rssi(dat){
    io.emit("rssi",dat);
}

module.exports.io = io;
module.exports.connect = connect;
module.exports.message = message;
module.exports.disconnect = disconnect;

module.exports.broadcast = broadcast;
module.exports.broadcast_log = broadcast_log;
module.exports.broadcast_status = broadcast_status;
module.exports.broadcast_rssi = broadcast_rssi;
