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
        users.push({ username, password, type: 'guest' });
    }
    res.json({ username });
});
app.post('/api/google', (req, res) => {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: 'Введи ник' });
    res.json({ username });
});

// --- ИГРОВАЯ ЛОГИКА ---
let players = {};
let bomb = { planted: false, timer: 40, defusing: false };

io.on('connection', (socket) => {
    socket.on('joinGame', (data) => {
        const team = data.team || 'CT'; 
        players[socket.id] = { 
            id: socket.id, username: data.username, team: team,
            x: team === 'CT' ? 120 : -120, z: team === 'CT' ? 120 : -120, 
            rotY: 0 
        };
        socket.emit('init', { selfId: socket.id, players, bomb });
        socket.broadcast.emit('playerJoined', players[socket.id]);
    });

    socket.on('move', (data) => {
        if (players[socket.id]) {
            Object.assign(players[socket.id], { x: data.x, z: data.z, rotY: data.rotY });
            socket.broadcast.emit('playerMoved', { id: socket.id, ...data });
        }
    });

    socket.on('shoot', (data) => {
        socket.broadcast.emit('playerShot', { id: socket.id, ...data });
    });

    // Заложить бомбу (Т)
    socket.on('plantBomb', (pos) => {
        const p = players[socket.id];
        if (p && p.team === 'T' && !bomb.planted) {
            bomb.planted = true;
            bomb.timer = 40;
            bomb.x = pos.x; bomb.z = pos.z;
            io.emit('bombPlanted', bomb);
            
            // Запускаем таймер
            const interval = setInterval(() => {
                if (bomb.planted) {
                    bomb.timer--;
                    io.emit('bombTick', bomb.timer);
                    if (bomb.timer <= 0) {
                        clearInterval(interval);
                        io.emit('gameOver', 'T'); // Террористы победили
                        bomb.planted = false;
                    }
                } else {
                    clearInterval(interval);
                }
            }, 1000);
        }
    });

    // Обезвредить (КТ)
    socket.on('defuseBomb', () => {
        const p = players[socket.id];
        if (p && p.team === 'CT' && bomb.planted && !bomb.defusing) {
            bomb.defusing = true;
            io.emit('bombDefusing', true);
            
            setTimeout(() => {
                if (bomb.defusing) {
                    bomb.planted = false;
                    bomb.defusing = false;
                    io.emit('gameOver', 'CT'); // КТ победили
                }
            }, 5000); // 5 секунд на снятие
        }
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
        io.emit('playerLeft', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log('Server started on ' + PORT));