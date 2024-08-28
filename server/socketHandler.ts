const socketIO = require('socket.io')

let io;

export const initSocket = (server) => {
    io = socketIO(server, { cors: { origin: "*"}});

    io.on('connection', () => {
        console.log("Socket connected")
    })

}

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.IO not initialized!');
      }
      return io;
}