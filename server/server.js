require("dotenv").config();
const express = require('express');
const app = express();
const path = require('path');
const PORT = process.env.NODE_SERVER_PORT;
const router = require("./Routes");
const socketIO = require("socket.io");

app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(express.json({ limit: '1mb' }));

app.use(express.static(path.join(__dirname, '../build')));
app.use(express.static(path.join(__dirname + "../public")));

app.use(router);

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

let server = app.listen(PORT, () => {
    console.log(`NODE server now on port ${PORT}`)
});
const io = socketIO(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {


    console.log("are we connected?")
    // socket.on('songRemoved', (event) => {
    //     socket.emit('songRemoved', { msg: 'Song Removed.' });
    // })

    // socket.on('updateAllLinks', (event) => {
    //     socket.emit("updateAllLinks", { msg: `Updating All Links` })
    // });

    // socket.on('refreshLinks', (event) => {
    //     socket.broadcast.emit("refreshLinks", { msg: `refresh` })
    // });

    // socket.on('changeNowPlaying', (event) => {
    //     io.emit("changeNowPlaying", { ...event })
    // });

    // socket.on("prevSong", event => {
    //     socket.broadcast.emit("prevSong", { ...event })
    // });

    // socket.on("nextSong", event => {
    //     socket.broadcast.emit("nextSong", { ...event })
    // });

    // socket.on("requestingSongInfo", event => {
    //     socket.broadcast.emit("requestingSongInfo", { ...event })
    // });

    // socket.on("sendingSongInfo", event => {
    //     socket.broadcast.emit("sendingSongInfo", { ...event })
    // });

    module.exports = io;
});