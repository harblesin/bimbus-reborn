const socketIO = require('socket.io')

let io;

const initSocket = (server) => {
    io = socketIO(server, { cors: { origin: "*"}});

    io.on('connection', (socket) => {
        console.log("Socket connected")
    })

}

const getIO = () => {
    if (!io) {
        throw new Error('Socket.IO not initialized!');
      }
      return io;
}

module.exports = {
    initSocket,
    getIO
}