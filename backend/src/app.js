const express = require('express');
const cors = require('cors');
const cookieParser = require("cookie-parser");
const morgan = require('morgan');

const envFile = process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.dev';
require('dotenv').config({ path: `${__dirname}/../${envFile}` });

const connectDB = require('./config/db.js');
const userRoutes = require('./routes/user.route.js');
const documentRoutes = require('./routes/document.route.js');

const app = express();

const allowedOrigins = ['http://localhost:5173', 'https://inker.ahmadasi.li', 'http://127.0.0.1:5173'];

const corsOptions = {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
};

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(morgan('combined'));

// Connect to the database
connectDB();

// Routes
app.use('/api/users', userRoutes);
app.use('/api/documents', documentRoutes);



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



// Start up server
app.listen(process.env.PORT, () => console.log(`INKER API listening on port ${process.env.PORT}!`));
