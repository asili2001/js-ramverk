const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const cookieParser = require("cookie-parser");
const morgan = require('morgan');
const AuthMiddleware = require('./middlewares/checkAuth.js');


const envFile = process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.dev';
require('dotenv').config({ path: `${__dirname}/../${envFile}` });

const connectDB = require('./config/db.js');
const userRoutes = require('./routes/user.route.js');
const documentRoutes = require('./routes/document.route.js');
const Document = require('./models/document.model.js');

const allowedOrigins = ['http://localhost:5173', 'https://inker.ahmadasi.li', 'http://127.0.0.1:5173', 'https://inker.ahmadasi.li/'];

const app = express();







const httpServer = require('http').createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        credentials: true
    }
});
const authMiddleware = new AuthMiddleware();

io.use(authMiddleware.checkSocketUser);

io.on('connection', async (socket) => {
    console.log("New client connected:", socket.id);
    
    // Get documentId from the handshake query
    const documentId = socket.handshake.query.documentId;
    

    // Find the document by ID
    const document = await Document.findById(documentId);
    if (!document) {
        console.log(`Document not found for ID: ${documentId}. Disconnecting client ${socket.id}.`);
        return socket.disconnect(); // Disconnect the client if the document is not found
    }

    // Check if the user has access to the document
    const hasAccess = document.usersWithAccess.find(access => access._id.equals(socket.user.id));
    if (!hasAccess) {
        console.log(`Access denied for user ${socket.user.id}. Disconnecting client ${socket.id}.`);
        return socket.disconnect(); // Disconnect the client if they don't have access
    }

    // Join the room associated with the document
    socket.join(documentId);
    console.log(`Client ${socket.id} joined document: ${documentId}`);

    // Handle text insertion
    socket.on('doc insertText', (data) => {
        console.log('Insert Text:', data);
        // Emit the updated document to all clients in the room
        io.to(documentId).emit('updateDocument', { changeType: "insert", owner: socket.id, ...data });
    });

    // Handle text replace
    socket.on('doc replaceText', (data) => {
        console.log('Replace Text:', data);
        // Emit the updated document to all clients in the room
        io.to(documentId).emit('updateDocument', { changeType: "replace", owner: socket.id, ...data });
    });

    // Handle text deletion
    socket.on('doc deleteText', (data) => {
        console.log('Delete Text:', data);
        // Emit the updated document to all clients in the room
        io.to(documentId).emit('updateDocument', { changeType: "delete", owner: socket.id, ...data });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
});




const corsOptions = {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
};

app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(morgan('combined'));

// Connect to the database
connectDB();
// 7 lines left

