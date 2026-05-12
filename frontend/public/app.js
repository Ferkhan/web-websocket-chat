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
const themeToggleBtn = document.getElementById('themeToggleBtn');
const themeIcon = document.getElementById('themeIcon');
const chatTitle = document.getElementById('chatTitle');

function updateThemeIcon(theme) {
    if (theme === 'dark') {
        themeIcon.className = 'bi bi-sun-fill';
        themeIcon.style.color = '#81c784'; // Amarillo/dorado para contraste en oscuro
        themeToggleBtn.classList.replace('btn-light', 'btn-dark');
    } else {
        themeIcon.className = 'bi bi-moon-fill';
        themeIcon.style.color = 'var(--primary-color)';
        themeToggleBtn.classList.replace('btn-dark', 'btn-light');
    }
}

// Inicializar el tema
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-bs-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-bs-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-bs-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
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
    chatTitle.textContent = currentUser;
    const userAvatar = document.getElementById('userAvatar');
    // Generar un avatar basado en el nombre de usuario usando ui-avatars, combinando con los colores de la app
    userAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser)}&background=4caf50&color=fff&rounded=true&bold=true`;
    userAvatar.style.display = 'block';
    
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
