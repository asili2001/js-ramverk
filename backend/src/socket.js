const { Server } = require('socket.io');
const http = require('http');
const AuthMiddleware = require('./middlewares/checkAuth.js');
const connectDB = require('./config/db.js');
var fs = require('fs');
const LZString = require('lz-string');
const appRoot = require('app-root-path');
const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;


const envFile = process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.dev';
require('dotenv').config({ path: `${__dirname}/../${envFile}` });

const Document = require('./models/document.model.js');
const documentController = require('./apollo/document.controller.js');

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
        fs.writeFileSync(filePath, JSON.stringify(emptyRawDraftContentState));
    }

    let fileContent = fs.readFileSync(filePath, 'utf8');
    let fileContentObj = null;
    try {
        fileContentObj = fileContent.length > 0 ? JSON.parse(fileContent) : null;
    } catch (error) {
        console.error(error);
        fileContentObj = null;
    }
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
const addToQueue = async (documentId, userId, update) => {
    const dbDocument = await Document.findById(documentId);
    if (!dbDocument) {
        io.to(documentId).emit('documentNotFound');
        return io.in(documentId).disconnectSockets(true);
    };
    const documentOwner = dbDocument.usersWithAccess.find(access => access.accessLevel === "owner");
    if (!documentOwner) return;
    const hasAccess = dbDocument.usersWithAccess.find(access => access.user._id.equals(userId) && ["owner", "editor"].includes(access.accessLevel));

    if (!hasAccess) return;
    if (!documentQueues[documentId]) {
        documentQueues[documentId] = [];
    }
    documentQueues[documentId].push(update);

    // Start processing if not already processing
    if (!processingFlags[documentId]) {
        processQueue(documentId, documentOwner.user._id);
    }
};


io.on('connection', async (socket) => {
    console.log("New client connected:", socket.id);

    const documentId = socket.handshake.query.documentId;
    if (!ObjectId.isValid(documentId)) {
        io.to(documentId).emit('documentNotFound');
        return io.in(documentId).disconnectSockets(true);
    }
    io.to(documentId).emit('new client', socket.id);

    const document = await Document.findById(documentId);
    if (!document) {
        console.log(`Document not found for ID: ${documentId}. Disconnecting client ${socket.id}.`);
        return socket.disconnect();
    }

    const hasAccess = document.usersWithAccess.find(access => access.user._id.equals(socket.user.id));
    if (!hasAccess) {
        console.log(`Access denied for user ${socket.user.id}. Disconnecting client ${socket.id}.`);
        return socket.disconnect();
    }

    socket.join(documentId);
    console.log(`Client ${socket.id} joined document: ${documentId}`);

    // Handle document content change event
    socket.on('doc change', async (data) => {
        const update = { owner: socket.id, data };
        addToQueue(documentId, socket.user.id, update);
    });

    // Handle document name and preview image update event
    socket.on('doc update', async (data) => {
        if (data.preview) {
            const imageBuffer = Buffer.from(data.preview, 'base64');
    
            const dir = `${appRoot.path}/drafts/${socket.user.id}/${documentId}`;
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
    
            fs.writeFile(`${dir}/preview.jpg`, imageBuffer, (err) => {
                if (err) {
                    console.error(`Socket error saving preview image to document ${documentId}`, err);
                }
            });
        }

        if (data.title) {
            try {
                await documentController.updateDocumentTitle(socket.user.id, documentId, data.title);
                io.to(documentId).emit("documentTitleChange", {
                    id: documentId,
                    title: data.title,
                    owner: socket.id
                })
            } catch(err) {
                console.error(`Socket error when updating document title document id: ${documentId}`, err)
            }

        }
    });

    // Handle new comments on document
    socket.on('doc comment', async (data) => {
        await documentController.updateDocumentComments(data, documentId);
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
