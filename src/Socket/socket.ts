import { io } from "socket.io-client";

const socketUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:8080' : 'https://bimbus.info';

const socket = io(socketUrl);

export default socket;