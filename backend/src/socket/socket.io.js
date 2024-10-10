
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