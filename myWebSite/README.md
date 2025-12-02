# Network Hub - Local File Sharing & Chat Server

A modern, professional web application that lets you share files and chat with anyone on your local network. Perfect for running on your mobile device using Termux or any device with Node.js.

## Features

### File Sharing
- **Drag & Drop Upload** - Simply drag files into the browser
- **Multiple File Upload** - Upload multiple files at once
- **Download Individual Files** - Download any shared file
- **Download All as ZIP** - Get all files in a single compressed archive
- **File Preview** - Smart icons based on file type
- **Real-time Notifications** - Get notified when new files are uploaded
- **File Management** - Delete files you no longer need

### Real-time Chat
- **Instant Messaging** - Real-time chat with all connected users
- **Online User List** - See who's currently connected
- **Typing Indicators** - Know when someone is typing
- **Chat History** - Messages persist during the session
- **System Notifications** - Get notified when users join/leave

### Modern UI
- **Crystal Clear Design** - Professional, modern interface
- **Responsive Layout** - Works on mobile, tablet, and desktop
- **Dark Theme Accents** - Beautiful gradient design
- **Smooth Animations** - Delightful user experience
- **Toast Notifications** - Non-intrusive status updates

### Easy Connection
- **QR Code Sharing** - Share connection URL via QR code
- **Auto Network Detection** - Automatically finds your local IP
- **One-Click Copy** - Copy connection URL to clipboard
- **Server Info Panel** - View server stats and connected users

## Installation

### On Android (Termux)

1. **Install Termux** from F-Droid (not Play Store)
   - Download from: https://f-droid.org/packages/com.termux/

2. **Update Termux packages**
   ```bash
   pkg update && pkg upgrade
   ```

3. **Install Node.js**
   ```bash
   pkg install nodejs-lts
   ```

4. **Install Git** (if you want to clone)
   ```bash
   pkg install git
   ```

5. **Navigate to your project**
   ```bash
   cd storage/shared/TerMuxServerApp
   ```

   Or clone if needed:
   ```bash
   git clone <your-repo-url>
   cd TerMuxServerApp
   ```

6. **Install dependencies**
   ```bash
   npm install
   ```

7. **Start the server**
   ```bash
   npm start
   ```

### On Windows/Mac/Linux

1. **Install Node.js** (v14 or higher)
   - Download from: https://nodejs.org/

2. **Navigate to project folder**
   ```bash
   cd TerMuxServerApp
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start the server**
   ```bash
   npm start
   ```

## Usage

### Starting the Server

1. Run `npm start` in the project directory
2. You'll see output like this:
   ```
   🚀 Network Hub Server Started!
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   📱 Local URL: http://localhost:3000
   🌐 Network URL: http://192.168.1.100:3000
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ```

3. Share the **Network URL** with others on the same WiFi

### Connecting from Other Devices

**Method 1: QR Code**
1. Open the Network URL on your device
2. Click the QR Code button in the header
3. Scan the QR code with other devices

**Method 2: Manual URL**
1. Share the Network URL (e.g., http://192.168.1.100:3000)
2. Others type this URL in their browser

### Using the App

1. **Enter Your Name** - When you first connect, enter your name
2. **Upload Files**:
   - Drag files onto the upload area
   - Click "Select Files" to browse
   - Upload multiple files at once
3. **Chat**:
   - Type your message in the input box
   - Press Enter or click Send
   - See online users at the top
4. **Download Files**:
   - Click download icon on any file
   - Click "Download All" for ZIP archive
5. **Manage Files**:
   - Delete individual files with trash icon
   - Clear all files with "Clear All" button

## Configuration

### Change Port

Edit `server.js` or set environment variable:

```bash
# Windows
set PORT=8080 && npm start

# Mac/Linux/Termux
PORT=8080 npm start
```

### File Size Limit

Edit the limit in `server.js` (line 35):

```javascript
limits: { fileSize: 500 * 1024 * 1024 } // 500MB default
```

### Upload Directory

Files are stored in `./uploads` by default. Change in `server.js`:

```javascript
const UPLOAD_DIR = path.join(__dirname, 'your-folder-name');
```

## Troubleshooting

### Can't Connect from Other Devices

1. **Check WiFi** - All devices must be on the same network
2. **Firewall** - Allow Node.js through your firewall
3. **Router Settings** - Some routers block device-to-device communication
4. **Use Local IP** - Make sure you're using the Network URL, not localhost

### Termux-Specific Issues

**Storage Permission**
```bash
termux-setup-storage
```

**Keep Running in Background**
```bash
# Install termux-services
pkg install termux-services

# Or use nohup
nohup npm start &
```

**Battery Optimization**
- Disable battery optimization for Termux in Android settings
- Keep phone plugged in for extended sessions

### Port Already in Use

```bash
# Change port
PORT=8080 npm start
```

### Files Not Uploading

1. Check file size limit (default 500MB)
2. Check disk space on server device
3. Check upload directory permissions

## Security Notes

⚠️ **Important**: This server is designed for **local network use only**

- No authentication by default
- Anyone on your WiFi can access it
- Don't expose to the public internet
- Files are not encrypted
- Use only on trusted networks

## Technical Stack

- **Backend**: Node.js + Express.js
- **Real-time**: Socket.io
- **File Upload**: Multer
- **File Compression**: Archiver
- **QR Codes**: qrcode library
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Icons**: Font Awesome 6

## File Structure

```
TerMuxServerApp/
├── server.js              # Main server file
├── package.json           # Dependencies
├── public/                # Frontend files
│   ├── index.html        # Main HTML
│   ├── styles.css        # Styles
│   └── app.js            # Client JavaScript
├── uploads/              # Uploaded files (created automatically)
└── README.md             # This file
```

## API Endpoints

### Files
- `GET /api/files` - List all files
- `POST /api/upload` - Upload single file
- `POST /api/upload-multiple` - Upload multiple files
- `GET /api/download/:filename` - Download file
- `DELETE /api/files/:filename` - Delete file
- `GET /api/download-all` - Download all as ZIP

### Server
- `GET /api/info` - Get server info and QR code
- `GET /api/chat/history` - Get chat history

### WebSocket Events
- `join` - Join with username
- `chat-message` - Send message
- `typing` - Typing indicator
- `users-update` - User list update
- `file-uploaded` - File upload notification

## Performance Tips

1. **Limit File Count** - Delete old files regularly
2. **Monitor Storage** - Check available space
3. **Restart Server** - Restart periodically to clear memory
4. **Use WiFi 5GHz** - Faster transfers on 5GHz networks
5. **Close Unused Apps** - Free up RAM on mobile device

## Future Enhancements

- [ ] Password protection
- [ ] File preview (images, PDFs)
- [ ] Video streaming
- [ ] User avatars
- [ ] Private messages
- [ ] File expiration
- [ ] Upload progress for multiple files
- [ ] Mobile app (React Native)
- [ ] End-to-end encryption

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License - Use freely for personal and commercial projects

---

**Made with ❤️ for local network sharing**

*Perfect for home, office, events, and anywhere you need quick file sharing without the cloud!*
