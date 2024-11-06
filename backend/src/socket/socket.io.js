

async function mySocket(io, socket) {
    console.log("New client connected:", socket.id);

    // Get documentId from the handshake query
    const documentId = socket.handshake.query.documentId;

    // Find the document by ID
    const document = await Document.findById(documentId);
    if (!document) {
        console.log(`Document not found for ID: ${documentId}. Disconnecting client ${socket.id}.`);
        return socket.disconnect();
    }

    // Check if the user has access to the document
    const hasAccess = document.usersWithAccess.find(access => access._id.equals(socket.user.id));
    if (!hasAccess) {
        console.log(`Access denied for user ${socket.user.id}. Disconnecting client ${socket.id}.`);
        return socket.disconnect();
    }

    // Join the room associated with the document
    socket.join(documentId);
    console.log(`Client ${socket.id} joined document: ${documentId}`);

    // Handle text insertion
    socket.on('doc insertText', (data) => {
        console.log('Insert Text:', data);
        io.to(documentId).emit('updateDocument', { changeType: "insert", owner: socket.id, ...data });
    });

    // Handle text replace
    socket.on('doc replaceText', (data) => {
        console.log('Replace Text:', data);
        io.to(documentId).emit('updateDocument', { changeType: "replace", owner: socket.id, ...data });
    });

    // Handle text deletion
    socket.on('doc deleteText', (data) => {
        console.log('Delete Text:', data);
        io.to(documentId).emit('updateDocument', { changeType: "delete", owner: socket.id, ...data });
    });

    // CREATE COMMENT
    socket.on('doc createComment', (data) => {
        console.log('Create Comment data:', data);
        io.to(documentId).emit('updateComment', { owner: socket.id, ...data });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
}

module.exports = mySocket;