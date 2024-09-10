import { Server } from 'socket.io';

let io: any;

export const initSocket = (server: any) => {
    try {
        io =  new Server(server, { cors: { origin: "*"}});    
        io.on('connection', () => {
            const now = new Date();
            return console.info(`${process.pid} | ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()} | Socket | New connection established`);
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
