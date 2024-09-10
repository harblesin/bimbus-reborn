import { Server } from 'socket.io';

let io: any;

export const initSocket = (server: any) => {
    try {
        io =  new Server(server, { cors: { origin: "*"}});    
        io.on('connection', () => {
            console.log("Socket connected")
        })
    } catch (err) {
        console.log(err)
    }

}

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.IO not initialized!');
      }
      return io;
}
