const { Server } = require('socket.io');
const http = require('http');
const connectDB = require('./config/db.js');

const envFile = process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.dev';
require('dotenv').config({ path: `${__dirname}/../${envFile}` });


const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",");
const socketServer = http.createServer();

const io = new Server(socketServer, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true
    }
});


/*



DENNA FILEN ANVÄNDS EJ





*/
// Connect to the database
connectDB();


io.on('connection', async (socket) => {
    console.log("New client connected:", socket.id);
    console.log("CONNNNEEECCCTED");
    /*
    // Handle document insert text event
    socket.on('doc change', async (data) => {
        const update = { owner: socket.id, data };
        addToQueue(documentId, socket.user.id, update);
    });
    */

    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
});

socketServer.listen(process.env.SOCKET_PORT, () => {
    console.log(`WebSocket server listening on port ${process.env.SOCKET_PORT}`);
});
