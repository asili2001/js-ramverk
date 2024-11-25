const { Server } = require('socket.io');
const http = require('http');
const AuthMiddleware = require('./middlewares/checkAuth.js');
const connectDB = require('./config/db.js');
var fs = require('fs');
const LZString = require('lz-string');
const appRoot = require('app-root-path');
const DocumentController = require('../src/controllers/document.controller.js')


const envFile = process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.dev';
require('dotenv').config({ path: `${__dirname}/../${envFile}` });

const Document = require('./models/document.model.js');
const { createFileIfNotExists } = require('./utils/createFileIfNotExists.js');

const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",");
const socketServer = http.createServer();

const io = new Server(socketServer, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Connect to the database
connectDB();

const authMiddleware = new AuthMiddleware();

io.use(authMiddleware.checkSocketUser);


const saveToFile = (documentId, userId, updates) => {

    let newBlocks = [];
    let newEntityMap = {};
    let currentBlockKeys = [];


    updates.forEach(update => {
        const decompressedData = JSON.parse(LZString.decompress(update.data));
        newBlocks = [...newBlocks, ...decompressedData.content.blocks];
        newEntityMap = decompressedData.content.entityMap;
        currentBlockKeys = decompressedData.currentBlockKeys;
    })

    // save the changes
    const dir = `${appRoot.path}/drafts/${userId}/${documentId}`;

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    const filePath = `${dir}/document`;
    const emptyRawDraftContentState = {
        blocks: [],
        entityMap: {}
    };
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, LZString.compress(JSON.stringify(emptyRawDraftContentState)));
    }

    let fileContent = fs.readFileSync(filePath, 'utf8');

    let fileContentObj = fileContent.length > 0 ? JSON.parse(fileContent) : emptyRawDraftContentState;
    if (!fileContentObj) {
        fileContentObj = emptyRawDraftContentState;
    }
    

    const newFileBlocks = [];

    currentBlockKeys.forEach(blockKey => {
        const foundFileBlock = fileContentObj.blocks.find(fblock => fblock.key === blockKey);
        const foundNewBlock = newBlocks.find(fblock => fblock.key === blockKey);
        
    
        if (foundNewBlock) {            
            newFileBlocks.push(foundNewBlock);
        } else if (foundFileBlock) {
            newFileBlocks.push(foundFileBlock);
        } else {
            // Log error if not found in either
            console.error(`Block ${blockKey} is not found in document ${documentId}`);
        }
    });

    fileContentObj.entityMap = JSON.stringify(fileContentObj.entityMap) !== JSON.stringify(newEntityMap) ? newEntityMap : fileContentObj.entityMap;
    fileContentObj.blocks = newFileBlocks;

    fs.writeFile(filePath, JSON.stringify(fileContentObj), err => {
        if (err) {
            console.error(err);
        } else {
            console.log("File has been saved");
        }
    });

}

// Document queues to store updates
const documentQueues = {};
// Track if a queue is being processed
const processingFlags = {};

const processQueue = async (documentId, userId) => {
    if (processingFlags[documentId]) return; // Prevent concurrent processing
    processingFlags[documentId] = true;

    const queue = documentQueues[documentId];
    while (queue && queue.length > 0) {
        // Process a batch of 10 updates at a time
        const updates = queue.splice(0, 10);

        try {
            const clients = await io.in(documentId).fetchSockets();
            if (clients.length > 0) {
                saveToFile(documentId, userId, updates);
                
                io.to(documentId).emit('updateDocument', updates);
            } else {
                console.warn(`No clients connected for document: ${documentId}`);
            }
        } catch (error) {
            console.error(`Error processing queue for document ${documentId}:`, error);
        }

        // delay between processing batches
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    // processing finished
    processingFlags[documentId] = false;
};

// Function to add updates to the queue
const addToQueue = (documentId, userId, update) => {
    if (!documentQueues[documentId]) {
        documentQueues[documentId] = [];
    }
    documentQueues[documentId].push(update);

    // Start processing if not already processing
    if (!processingFlags[documentId]) {
        processQueue(documentId, userId);
    }
};


io.on('connection', async (socket) => {
    console.log("New client connected:", socket.id);

    const documentId = socket.handshake.query.documentId;
    io.to(documentId).emit('new client', socket.id);

    const document = await Document.findById(documentId);
    if (!document) {
        console.log(`Document not found for ID: ${documentId}. Disconnecting client ${socket.id}.`);
        return socket.disconnect();
    }

    const hasAccess = document.usersWithAccess.find(access => access._id.equals(socket.user.id));
    if (!hasAccess) {
        console.log(`Access denied for user ${socket.user.id}. Disconnecting client ${socket.id}.`);
        return socket.disconnect();
    }

    socket.join(documentId);
    console.log(`Client ${socket.id} joined document: ${documentId}`);

    // Handle document insert text event
    socket.on('doc change', async (data) => {
        const update = { owner: socket.id, data };
        addToQueue(documentId, socket.user.id, update);
    });

    // Handle new comments on document
    socket.on('doc comment', async (data) => {
        await DocumentController.updateDocumentComments(data, documentId);
        const update = data;
        try {
            const clients = await io.in(documentId).fetchSockets();
            if (clients.length > 0) {
                io.to(documentId).emit('updateComment', update);
            } else {
                console.warn(`No clients connected for document: ${documentId}`);
            }
        } catch (error) {
            console.error(`Error sending comment update for document ${documentId}:`, error);
        }
    });

    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
});

socketServer.listen(process.env.SOCKET_PORT, () => {
    console.log(`WebSocket server listening on port ${process.env.SOCKET_PORT}`);
});
