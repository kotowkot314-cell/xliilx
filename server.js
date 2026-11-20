const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('client'));

let users = {}; 
let players = {};

io.on('connection', (socket) => {
    socket.on('login', (username, callback) => {
        users[socket.id] = username;
        players[socket.id] = { id: socket.id, username, x: 400, y: 300, angle: 0 };
        socket.emit('init', { selfId: socket.id, players });
        socket.broadcast.emit('playerJoined', players[socket.id]);
        callback({ success: true });
    });

    socket.on('move', (data) => {
        if (players[socket.id]) {
            players[socket.id].x = data.x;
            players[socket.id].y = data.y;
            players[socket.id].angle = data.angle;
            socket.broadcast.emit('playerMoved', { id: socket.id, ...data });
        }
    });

    socket.on('shoot', (data) => {
        socket.broadcast.emit('playerShot', { id: socket.id, ...data });
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
        delete users[socket.id];
        io.emit('playerLeft', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log('Server started on ' + PORT));