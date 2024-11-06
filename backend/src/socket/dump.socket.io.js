module.exports = {
    createRoom: function (io, socket, room) {
        console.log("socket joining room: ", room);
        socket.join(room);
    },

    handleDoc: function (io, socket, data) {
        console.log("socket update on doc: ", data);
        socket.to(data["_id"]).emit("doc", data);
        // save to db/file
    },

};




// FÖRRA KODEN TIDIGARE I app.js
/*
// Socket imports
const httpServer = require("http").createServer(app);
const socketioJwt = require('socketio-jwt');
const createRoom = require("./socket/socket.io.js");
const handleDoc = require("./socket/socket.io.js");


// Socket setup
const io = require("socket.io")(httpServer, {
    cors: {
        origin: ['http://localhost:5173', 'https://inker.ahmadasi.li', 'http://127.0.0.1:5173'],
        methods: ["GET", "POST"]
    }
});


// Socket events
io.sockets.on('connection', socketioJwt.authorize({
        secret: 'SECRET_KEY',
        timeout: 15000
    })).on('authenticated', function(socket) {
        console.log(`Socket Authenticated! ${socket.decoded_token.name}`);
        console.log(socket.id);
        
        socket.on('create', createRoom(io, socket, room));
        socket.on("doc", handleDoc(io, socket, data));

        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
});
*/