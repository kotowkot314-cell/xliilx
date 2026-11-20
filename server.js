const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.json());
app.use(express.static('client'));

let users = [];

app.post('/api/guest', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Заполни все поля' });
    let user = users.find(u => u.username === username);
    if (user) {
        if (user.password !== password) return res.status(400).json({ error: 'Неверный пароль' });
    } else {
        users.push({ username, password });
    }
    res.json({ username });
});

app.post('/api/google', (req, res) => {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: 'Введи ник' });
    res.json({ username });
});

let players = {};

io.on('connection', (socket) => {
    socket.on('joinGame', (username) => {
        players[socket.id] = { id: socket.id, username, x: 400, y: 300, angle: 0 };
        socket.emit('init', { selfId: socket.id, players });
        socket.broadcast.emit('playerJoined', players[socket.id]);
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
        io.emit('playerLeft', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log('Server started on ' + PORT));