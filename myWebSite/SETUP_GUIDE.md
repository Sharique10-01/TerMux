# Quick Setup Guide for Termux

## Step-by-Step Setup on Android

### 1. Install Termux (5 minutes)

**Important**: Install from F-Droid, NOT Google Play Store!

1. Open your browser and go to: https://f-droid.org/
2. Search for "Termux"
3. Download and install Termux
4. Open Termux

### 2. Prepare Termux (5 minutes)

Run these commands one by one:

```bash
# Update packages
pkg update && pkg upgrade

# Press 'Y' and Enter when asked

# Install Node.js
pkg install nodejs-lts

# Press 'Y' and Enter when asked

# Give Termux storage permission
termux-setup-storage

# Allow permission when Android asks
```

### 3. Navigate to Project (1 minute)

If you already have the project files:

```bash
# Go to shared storage
cd storage/shared

# List folders to find your project
ls

# Go into project folder (replace with your actual folder name)
cd TerMuxServerApp
```

If you're starting fresh in Termux:

```bash
# Create a new project folder
mkdir network-hub
cd network-hub

# Then copy all the project files here
```

### 4. Install Dependencies (2 minutes)

```bash
# Install all required packages
npm install

# Wait for it to complete (might take 1-2 minutes)
```

### 5. Start the Server (1 second!)

```bash
# Start the server
npm start
```

You should see:

```
🚀 Network Hub Server Started!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📱 Local URL: http://localhost:3000
🌐 Network URL: http://192.168.1.100:3000
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 6. Access from Any Device

1. **On your phone**: Open browser and go to `http://localhost:3000`
2. **On other devices**: Use the Network URL (e.g., `http://192.168.1.100:3000`)

## Tips for Running on Mobile

### Keep Server Running

**Option 1: Keep Termux Open**
- Just keep Termux app open
- Turn off battery optimization for Termux

**Option 2: Run in Background**
```bash
# Run server in background
npm start &

# Or use nohup to keep it running even if you close Termux
nohup npm start > server.log 2>&1 &
```

**Option 3: Use Wake Lock**
- Install Termux:Wake from F-Droid
- Keeps device awake while server runs

### Stop the Server

Press `Ctrl + C` in Termux

Or if running in background:
```bash
# Find process
ps aux | grep node

# Kill it (replace PID with actual number)
kill <PID>
```

### Restart the Server

```bash
# Stop with Ctrl+C, then:
npm start
```

### Check if Server is Running

```bash
# See all Node processes
ps aux | grep node

# Or try accessing
curl http://localhost:3000
```

### Battery Optimization

To prevent Android from killing Termux:

1. Go to Android Settings
2. Apps → Termux
3. Battery → Unrestricted
4. Remove from battery optimization

### Storage Issues

If you run out of space:

```bash
# Check disk space
df -h

# Remove old uploads
rm -rf uploads/*

# Clear npm cache
npm cache clean --force
```

## Common Issues

### "Permission Denied"

```bash
# Fix permissions
chmod +x server.js
```

### "Port Already in Use"

```bash
# Use different port
PORT=8080 npm start
```

### "Cannot find module"

```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### "Network URL not accessible"

1. Make sure all devices are on the same WiFi
2. Check if your router allows device-to-device communication
3. Try disabling VPN if you have one
4. Check firewall settings

### Server Crashes

```bash
# Check logs
cat server.log

# Restart with logging
npm start 2>&1 | tee server.log
```

## Accessing from Different Devices

### From Windows PC

1. Open browser (Chrome, Firefox, Edge)
2. Type the Network URL: `http://192.168.1.100:3000`
3. Enter your name and start using!

### From iPhone/iPad

1. Open Safari or Chrome
2. Type the Network URL
3. You can "Add to Home Screen" for quick access

### From Another Android Phone

1. Open Chrome or any browser
2. Type the Network URL
3. Bookmark it for easy access

### From Mac

1. Open Safari or Chrome
2. Type the Network URL
3. Works perfectly!

### Using QR Code

1. Open the server on your phone
2. Click the QR code button (top right)
3. Let others scan with their camera app
4. They'll be taken directly to the server!

## Performance Tips

### For Best Performance

1. **Use 5GHz WiFi** - Much faster than 2.4GHz
2. **Close other apps** - Free up RAM
3. **Keep phone plugged in** - Prevents battery throttling
4. **Good WiFi signal** - Stay close to router
5. **Don't upload huge files** - Stick to under 500MB

### Expected Performance

- **Chat**: Instant, no lag
- **Small files (<10MB)**: 1-5 seconds
- **Medium files (10-100MB)**: 10-30 seconds
- **Large files (100-500MB)**: 1-5 minutes

Speed depends on your WiFi!

## Security Reminders

- ✅ Use only on trusted WiFi (home, office)
- ✅ Don't share sensitive documents
- ✅ Clear files after sharing
- ❌ Never expose to public internet
- ❌ Don't use on public WiFi
- ❌ Don't leave running unattended

## Useful Commands

```bash
# Check Node version
node --version

# Check npm version
npm --version

# See server logs in real-time
tail -f server.log

# Find your IP address
ifconfig | grep inet

# Test if port is open
netstat -an | grep 3000

# Clear all uploaded files
rm -rf uploads/*
```

## Need Help?

1. Check the main README.md file
2. Look at error messages in Termux
3. Try restarting the server
4. Reinstall dependencies: `npm install`
5. Restart Termux app

---

**You're all set! Enjoy your local network hub!** 🚀
