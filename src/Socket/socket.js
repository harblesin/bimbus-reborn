import { io } from "socket.io-client";

// const socket = io(process.env.SOCKET_URL);
const socketUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:8080' : 'https://bimbus.info';

const socket = io(socketUrl);


export default socket;