const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
const SECRET = 'xliilx-super-secret';

app.use(express.json());
app.use(express.static('client'));

// --- REST API ДЛЯ РЕГИСТРАЦИИ ---

// Вход/Регистрация гостя
app.post('/api/guest', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Заполни все поля' });

    let user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

    if (user) {
        // Если существует, проверяем пароль (вход)
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ error: 'Неверный пароль' });
        db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);
    } else {
        // Если нет, создаем нового
        const hash = await bcrypt.hash(password, 10);
        const info = db.prepare('INSERT INTO users (username, password, type) VALUES (?, ?, ?)').run(username, hash, 'guest');
        user = { id: info.lastInsertRowid, username };
    }

    const token = jwt.sign({ id: user.id, username: user.username }, SECRET);
    res.json({ token, username: user.username });
});

// Имитация входа через Google (навсегда)
app.post('/api/google', (req, res) => {
    const { username } = req.body;
    // В реальности тут проверка токена Google, а мы просто создаем "вечный" аккаунт
    let user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    
    if (!user) {
        const info = db.prepare('INSERT INTO users (username, type) VALUES (?, ?)').run(username, 'google');
        user = { id: info.lastInsertRowid, username };
    }
    const token = jwt.sign({ id: user.id, username: user.username }, SECRET);
    res.json({ token, username: user.username });
});

// --- ИГРОВАЯ ЛОГИКА (SOCKET.IO) ---

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