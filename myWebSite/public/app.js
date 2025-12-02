// Socket.io connection
let socket;
let currentUsername = '';
let typingTimeout;

// DOM Elements
const welcomeModal = document.getElementById('welcomeModal');
const mainContainer = document.getElementById('mainContainer');
const usernameInput = document.getElementById('usernameInput');
const joinBtn = document.getElementById('joinBtn');

// File elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const selectFilesBtn = document.getElementById('selectFilesBtn');
const filesList = document.getElementById('filesList');
const uploadProgress = document.getElementById('uploadProgress');
const uploadFileName = document.getElementById('uploadFileName');
const uploadPercent = document.getElementById('uploadPercent');
const progressFill = document.getElementById('progressFill');
const refreshFilesBtn = document.getElementById('refreshFilesBtn');
const downloadAllBtn = document.getElementById('downloadAllBtn');
const clearAllBtn = document.getElementById('clearAllBtn');

// Chat elements
const messagesContainer = document.getElementById('messagesContainer');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const onlineUsersList = document.getElementById('onlineUsersList');
const typingIndicator = document.getElementById('typingIndicator');
const typingUser = document.getElementById('typingUser');
const clearChatBtn = document.getElementById('clearChatBtn');

// Header elements
const userCount = document.getElementById('userCount');
const fileCount = document.getElementById('fileCount');
const qrCodeBtn = document.getElementById('qrCodeBtn');
const infoBtn = document.getElementById('infoBtn');

// Modal elements
const qrModal = document.getElementById('qrModal');
const infoModal = document.getElementById('infoModal');
const qrCodeContainer = document.getElementById('qrCodeContainer');
const connectionUrl = document.getElementById('connectionUrl');
const copyUrlBtn = document.getElementById('copyUrlBtn');

// Toast
const toast = document.getElementById('toast');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Welcome modal
    joinBtn.addEventListener('click', joinNetwork);
    usernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') joinNetwork();
    });

    // File upload
    selectFilesBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        const files = Array.from(e.dataTransfer.files);
        uploadFiles(files);
    });

    // File actions
    refreshFilesBtn.addEventListener('click', loadFiles);
    downloadAllBtn.addEventListener('click', downloadAll);
    clearAllBtn.addEventListener('click', clearAllFiles);

    // Chat
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
    messageInput.addEventListener('input', handleTyping);
    clearChatBtn.addEventListener('click', clearChat);

    // Modals
    qrCodeBtn.addEventListener('click', () => showModal('qrModal'));
    infoBtn.addEventListener('click', () => showModal('infoModal'));
    copyUrlBtn.addEventListener('click', copyUrl);

    // Close modals
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modalId = e.target.closest('.close-modal').dataset.modal;
            closeModal(modalId);
        });
    });

    // Click outside modal to close
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}

// Join network
function joinNetwork() {
    const username = usernameInput.value.trim();
    if (!username) {
        showToast('Please enter your name', 'error');
        return;
    }

    currentUsername = username;
    welcomeModal.style.display = 'none';
    mainContainer.style.display = 'block';

    // Initialize socket connection
    initSocket();

    // Load initial data
    loadServerInfo();
    loadFiles();
}

// Initialize socket connection
function initSocket() {
    socket = io();

    socket.emit('join', currentUsername);

    // Socket event listeners
    socket.on('chat-history', (messages) => {
        messages.forEach(msg => displayMessage(msg));
    });

    socket.on('chat-message', (message) => {
        displayMessage(message);
    });

    socket.on('system-message', (message) => {
        displaySystemMessage(message.message);
    });

    socket.on('users-update', (users) => {
        updateUsersList(users);
        userCount.textContent = users.length;
        document.getElementById('infoUserCount').textContent = users.length;
    });

    socket.on('user-typing', (data) => {
        if (data.isTyping) {
            typingUser.textContent = data.username;
            typingIndicator.style.display = 'block';
        } else {
            typingIndicator.style.display = 'none';
        }
    });

    socket.on('file-uploaded', (fileInfo) => {
        showToast(`New file uploaded: ${fileInfo.originalName}`, 'success');
        loadFiles();
    });

    socket.on('files-uploaded', (data) => {
        showToast(`${data.count} files uploaded`, 'success');
        loadFiles();
    });

    socket.on('file-deleted', (data) => {
        loadFiles();
    });

    socket.on('disconnect', () => {
        displaySystemMessage('Connection lost. Reconnecting...');
    });

    socket.on('connect', () => {
        if (currentUsername) {
            displaySystemMessage('Connected to server');
        }
    });
}

// Load server info
async function loadServerInfo() {
    try {
        const response = await fetch('/api/info');
        const data = await response.json();

        connectionUrl.value = data.url;
        qrCodeContainer.innerHTML = `<img src="${data.qrCode}" alt="QR Code">`;
        document.getElementById('infoUrl').textContent = data.url;

        if (data.connectedUsers !== undefined) {
            userCount.textContent = data.connectedUsers;
            document.getElementById('infoUserCount').textContent = data.connectedUsers;
        }
    } catch (error) {
        console.error('Failed to load server info:', error);
    }
}

// Load files
async function loadFiles() {
    try {
        const response = await fetch('/api/files');
        const data = await response.json();

        fileCount.textContent = data.files.length;
        document.getElementById('infoFileCount').textContent = data.files.length;

        if (data.files.length === 0) {
            filesList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>No files yet</p>
                </div>
            `;
        } else {
            filesList.innerHTML = data.files.map(file => createFileElement(file)).join('');

            // Add event listeners to file actions
            document.querySelectorAll('.file-download').forEach(btn => {
                btn.addEventListener('click', () => downloadFile(btn.dataset.filename));
            });

            document.querySelectorAll('.file-delete').forEach(btn => {
                btn.addEventListener('click', () => deleteFile(btn.dataset.filename));
            });
        }
    } catch (error) {
        console.error('Failed to load files:', error);
        showToast('Failed to load files', 'error');
    }
}

// Create file element
function createFileElement(file) {
    const icon = getFileIcon(file.type);
    const size = formatFileSize(file.size);
    const date = new Date(file.uploadedAt).toLocaleString();

    return `
        <div class="file-item">
            <div class="file-icon">
                <i class="fas fa-${icon}"></i>
            </div>
            <div class="file-info">
                <div class="file-name" title="${file.name}">${file.name}</div>
                <div class="file-meta">
                    <span><i class="fas fa-weight-hanging"></i> ${size}</span>
                    <span><i class="fas fa-clock"></i> ${date}</span>
                </div>
            </div>
            <div class="file-actions">
                <button class="file-download" data-filename="${file.name}" title="Download">
                    <i class="fas fa-download"></i>
                </button>
                <button class="file-delete" data-filename="${file.name}" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
}

// Get file icon based on type
function getFileIcon(type) {
    if (type.startsWith('image/')) return 'file-image';
    if (type.startsWith('video/')) return 'file-video';
    if (type.startsWith('audio/')) return 'file-audio';
    if (type.includes('pdf')) return 'file-pdf';
    if (type.includes('word') || type.includes('document')) return 'file-word';
    if (type.includes('excel') || type.includes('sheet')) return 'file-excel';
    if (type.includes('powerpoint') || type.includes('presentation')) return 'file-powerpoint';
    if (type.includes('zip') || type.includes('rar') || type.includes('compressed')) return 'file-archive';
    if (type.includes('text')) return 'file-alt';
    return 'file';
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Handle file select
function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    uploadFiles(files);
    fileInput.value = '';
}

// Upload files
async function uploadFiles(files) {
    if (files.length === 0) return;

    const formData = new FormData();

    if (files.length === 1) {
        formData.append('file', files[0]);
        uploadProgress.style.display = 'block';
        uploadFileName.textContent = files[0].name;

        try {
            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    const percent = Math.round((e.loaded / e.total) * 100);
                    uploadPercent.textContent = percent + '%';
                    progressFill.style.width = percent + '%';
                }
            });

            xhr.addEventListener('load', () => {
                if (xhr.status === 200) {
                    showToast('File uploaded successfully', 'success');
                    loadFiles();
                } else {
                    showToast('Upload failed', 'error');
                }
                uploadProgress.style.display = 'none';
            });

            xhr.addEventListener('error', () => {
                showToast('Upload failed', 'error');
                uploadProgress.style.display = 'none';
            });

            xhr.open('POST', '/api/upload');
            xhr.send(formData);
        } catch (error) {
            console.error('Upload error:', error);
            showToast('Upload failed', 'error');
            uploadProgress.style.display = 'none';
        }
    } else {
        // Multiple files
        files.forEach(file => formData.append('files', file));
        uploadProgress.style.display = 'block';
        uploadFileName.textContent = `Uploading ${files.length} files...`;
        progressFill.style.width = '50%';

        try {
            const response = await fetch('/api/upload-multiple', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                showToast(`${files.length} files uploaded successfully`, 'success');
                loadFiles();
            } else {
                showToast('Upload failed', 'error');
            }
        } catch (error) {
            console.error('Upload error:', error);
            showToast('Upload failed', 'error');
        } finally {
            uploadProgress.style.display = 'none';
        }
    }
}

// Download file
function downloadFile(filename) {
    window.location.href = `/api/download/${encodeURIComponent(filename)}`;
}

// Delete file
async function deleteFile(filename) {
    if (!confirm(`Delete ${filename}?`)) return;

    try {
        const response = await fetch(`/api/files/${encodeURIComponent(filename)}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showToast('File deleted', 'success');
            loadFiles();
        } else {
            showToast('Failed to delete file', 'error');
        }
    } catch (error) {
        console.error('Delete error:', error);
        showToast('Failed to delete file', 'error');
    }
}

// Download all files
function downloadAll() {
    window.location.href = '/api/download-all';
}

// Clear all files
async function clearAllFiles() {
    if (!confirm('Delete all files? This cannot be undone.')) return;

    try {
        const response = await fetch('/api/files');
        const data = await response.json();

        for (const file of data.files) {
            await fetch(`/api/files/${encodeURIComponent(file.name)}`, {
                method: 'DELETE'
            });
        }

        showToast('All files deleted', 'success');
        loadFiles();
    } catch (error) {
        console.error('Clear error:', error);
        showToast('Failed to clear files', 'error');
    }
}

// Send message
function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    socket.emit('chat-message', { message });
    messageInput.value = '';
    socket.emit('typing', false);
}

// Display message
function displayMessage(message) {
    const isOwn = message.userId === socket.id;
    const time = new Date(message.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    });

    const avatar = message.username.charAt(0).toUpperCase();

    const messageEl = document.createElement('div');
    messageEl.className = `message ${isOwn ? 'own' : ''}`;
    messageEl.innerHTML = `
        <div class="message-avatar">${avatar}</div>
        <div class="message-content">
            <div class="message-header">
                <span class="message-username">${message.username}</span>
                <span class="message-time">${time}</span>
            </div>
            <div class="message-text">${escapeHtml(message.message)}</div>
        </div>
    `;

    messagesContainer.appendChild(messageEl);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Display system message
function displaySystemMessage(text) {
    const messageEl = document.createElement('div');
    messageEl.className = 'system-message';
    messageEl.innerHTML = `<i class="fas fa-info-circle"></i> ${text}`;
    messagesContainer.appendChild(messageEl);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Handle typing
function handleTyping() {
    socket.emit('typing', true);

    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        socket.emit('typing', false);
    }, 1000);
}

// Update users list
function updateUsersList(users) {
    onlineUsersList.innerHTML = users.map(user => {
        const isYou = user.id === socket.id;
        return `
            <span class="user-badge">
                <i class="fas fa-circle"></i>
                ${user.username}${isYou ? ' (You)' : ''}
            </span>
        `;
    }).join('');
}

// Clear chat
function clearChat() {
    if (!confirm('Clear chat history for you? (Others will still see messages)')) return;

    const systemMessages = messagesContainer.querySelectorAll('.system-message');
    messagesContainer.innerHTML = '';
    systemMessages.forEach(msg => messagesContainer.appendChild(msg.cloneNode(true)));

    showToast('Chat cleared', 'success');
}

// Modal functions
function showModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';

    if (modalId === 'infoModal') {
        loadServerInfo();
        loadFiles();
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Copy URL
function copyUrl() {
    connectionUrl.select();
    document.execCommand('copy');
    showToast('URL copied to clipboard', 'success');
}

// Show toast notification
function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = `toast ${type} show`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
