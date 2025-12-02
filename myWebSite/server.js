const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const qrcode = require('qrcode');
const os = require('os');
const mime = require('mime-types');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = process.env.PORT || 3000;
const UPLOAD_DIR = path.join(__dirname, 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 500 * 1024 * 1024 } // 500MB limit
});

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Store connected users
const users = new Map();
const chatHistory = [];
const MAX_CHAT_HISTORY = 100;

// Get local IP address
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

// API Routes

// Get server info
app.get('/api/info', async (req, res) => {
    const localIP = getLocalIP();
    const url = `http://${localIP}:${PORT}`;

    try {
        const qrCode = await qrcode.toDataURL(url);
        res.json({
            url: url,
            qrCode: qrCode,
            connectedUsers: users.size,
            uploadedFiles: fs.readdirSync(UPLOAD_DIR).length
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to generate QR code' });
    }
});

// Get list of uploaded files
app.get('/api/files', (req, res) => {
    try {
        const files = fs.readdirSync(UPLOAD_DIR).map(filename => {
            const filePath = path.join(UPLOAD_DIR, filename);
            const stats = fs.statSync(filePath);
            return {
                name: filename,
                size: stats.size,
                uploadedAt: stats.mtime,
                type: mime.lookup(filename) || 'application/octet-stream'
            };
        }).sort((a, b) => b.uploadedAt - a.uploadedAt);

        res.json({ files });
    } catch (err) {
        res.status(500).json({ error: 'Failed to read files' });
    }
});

// Upload file
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileInfo = {
        name: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype
    };

    // Notify all connected clients about new file
    io.emit('file-uploaded', fileInfo);

    res.json({
        success: true,
        file: fileInfo
    });
});

// Upload multiple files
app.post('/api/upload-multiple', upload.array('files', 50), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
    }

    const files = req.files.map(file => ({
        name: file.filename,
        originalName: file.originalname,
        size: file.size,
        type: file.mimetype
    }));

    // Notify all connected clients
    io.emit('files-uploaded', { count: files.length, files });

    res.json({
        success: true,
        count: files.length,
        files: files
    });
});

// Download file
app.get('/api/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(UPLOAD_DIR, filename);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found' });
    }

    res.download(filePath, filename);
});

// Delete file
app.delete('/api/files/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(UPLOAD_DIR, filename);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found' });
    }

    try {
        fs.unlinkSync(filePath);
        io.emit('file-deleted', { name: filename });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete file' });
    }
});

// Download all files as zip
app.get('/api/download-all', (req, res) => {
    const files = fs.readdirSync(UPLOAD_DIR);

    if (files.length === 0) {
        return res.status(404).json({ error: 'No files to download' });
    }

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename=all-files.zip');

    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.on('error', (err) => {
        res.status(500).json({ error: 'Failed to create archive' });
    });

    archive.pipe(res);

    files.forEach(filename => {
        const filePath = path.join(UPLOAD_DIR, filename);
        archive.file(filePath, { name: filename });
    });

    archive.finalize();
});

// Get chat history
app.get('/api/chat/history', (req, res) => {
    res.json({ messages: chatHistory });
});

// Socket.IO for real-time chat
io.on('connection', (socket) => {
    console.log('New user connected:', socket.id);

    // Handle user joining
    socket.on('join', (username) => {
        users.set(socket.id, {
            id: socket.id,
            username: username || `User_${socket.id.substring(0, 4)}`,
            joinedAt: new Date()
        });

        // Send chat history to new user
        socket.emit('chat-history', chatHistory);

        // Broadcast user list update
        io.emit('users-update', Array.from(users.values()));

        // Broadcast join notification
        const joinMessage = {
            type: 'system',
            message: `${users.get(socket.id).username} joined the chat`,
            timestamp: new Date().toISOString()
        };
        io.emit('system-message', joinMessage);
    });

    // Handle chat messages
    socket.on('chat-message', (data) => {
        const user = users.get(socket.id);
        if (!user) return;

        const message = {
            id: Date.now() + Math.random(),
            userId: socket.id,
            username: user.username,
            message: data.message,
            timestamp: new Date().toISOString(),
            type: 'message'
        };

        // Add to history
        chatHistory.push(message);
        if (chatHistory.length > MAX_CHAT_HISTORY) {
            chatHistory.shift();
        }

        // Broadcast to all clients
        io.emit('chat-message', message);
    });

    // Handle typing indicator
    socket.on('typing', (isTyping) => {
        const user = users.get(socket.id);
        if (!user) return;

        socket.broadcast.emit('user-typing', {
            userId: socket.id,
            username: user.username,
            isTyping
        });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        const user = users.get(socket.id);
        if (user) {
            const leaveMessage = {
                type: 'system',
                message: `${user.username} left the chat`,
                timestamp: new Date().toISOString()
            };
            io.emit('system-message', leaveMessage);
            users.delete(socket.id);
            io.emit('users-update', Array.from(users.values()));
        }
        console.log('User disconnected:', socket.id);
    });
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
    const localIP = getLocalIP();
    console.log('\n🚀 Network Hub Server Started!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📱 Local URL: http://localhost:${PORT}`);
    console.log(`🌐 Network URL: http://${localIP}:${PORT}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💡 Share the Network URL with devices on same WiFi');
    console.log('📁 Files will be saved in: ./uploads');
    console.log('\nPress Ctrl+C to stop the server\n');
});
