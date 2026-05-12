let ws;
let connected = false;
let currentUser = "";

// DOM Elements
const loginScreen = document.getElementById('login-screen');
const chatScreen = document.getElementById('chat-screen');
const loginBtn = document.getElementById('loginBtn');
const usernameInput = document.getElementById('usernameInput');
const messages = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const statusDiv = document.getElementById('status');
const themeToggle = document.getElementById('themeToggle');

// Inicializar el tema
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-bs-theme', savedTheme);
    themeToggle.checked = savedTheme === 'dark';
}

themeToggle.addEventListener('change', () => {
    const newTheme = themeToggle.checked ? 'dark' : 'light';
    document.documentElement.setAttribute('data-bs-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

// Login y mostrar chat
loginBtn.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    if (!username) {
        alert('Por favor ingresa tu nombre de usuario');
        usernameInput.focus();
        return;
    }
    
    currentUser = username;
    
    // Cambiar pantallas
    loginScreen.style.display = 'none';
    chatScreen.style.display = 'flex';
    
    // Conectar WebSocket
    connect();
    
    // Focus en input de mensaje
    messageInput.focus();
});

usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        loginBtn.click();
    }
});

function connect() {
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws = new WebSocket(`${protocol}//localhost:3000`);

    ws.onopen = () => {
        connected = true;
        statusDiv.textContent = 'Conectado';
        statusDiv.className = 'badge bg-success';
        sendBtn.disabled = false;
    };

    ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        addMessage(msg.username, msg.text, msg.timestamp);
    };

    ws.onclose = () => {
        connected = false;
        statusDiv.textContent = 'Desconectado - Reconectando...';
        statusDiv.className = 'badge bg-danger';
        sendBtn.disabled = true;
        setTimeout(connect, 3000);
    };

    ws.onerror = (error) => {
        console.error('Error WebSocket:', error);
    };
}

function addMessage(username, text, timestamp) {
    const msgDiv = document.createElement('div');
    
    // Determinar clases basado en si es mensaje propio o recibido
    // Requerimiento: Mensajes propios alineados a la izquierda, recibidos a la derecha
    const isOwnMessage = username === currentUser;
    msgDiv.className = `message ${isOwnMessage ? 'message-sent' : 'message-received'}`;
    
    msgDiv.innerHTML = `
        <span class="username">${username}</span> 
        <span class="text">${text}</span>
        <span class="timestamp">${timestamp}</span>
    `;
    
    messages.appendChild(msgDiv);
    // Auto-scroll
    messages.scrollTop = messages.scrollHeight;
}

function sendMessage() {
    const text = messageInput.value.trim();

    if (!text) {
        messageInput.focus();
        return;
    }

    if (!connected) {
        alert('No hay conexión al servidor');
        return;
    }

    ws.send(JSON.stringify({ username: currentUser, text }));
    messageInput.value = '';
    messageInput.focus();
}

// Event listeners de chat
sendBtn.addEventListener('click', sendMessage);

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Init
initTheme();
usernameInput.focus();
