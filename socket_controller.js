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

module.exports.io = io;
module.exports.connect = connect;
module.exports.message = message;
module.exports.disconnect = disconnect;
module.exports.broadcast = broadcast;
