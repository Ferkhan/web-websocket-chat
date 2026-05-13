import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
    signOut,
    getIdToken,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// TODO: Reemplaza con tu Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyDVwqZS33TFvAOvINg4fTi94MB6NmIJYLg",
    authDomain: "casual-services.firebaseapp.com",
    projectId: "casual-services",
    storageBucket: "casual-services.firebasestorage.app",
    messagingSenderId: "80279791025",
    appId: "1:80279791025:web:502b98c7e3ebeaf8e48990"

};


// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

let ws;
let connected = false;
let currentUser = "";

// DOM Elements
const loginScreen = document.getElementById('login-screen');
const chatScreen = document.getElementById('chat-screen');
const loginFormContainer = document.getElementById('login-form-container');
const registerFormContainer = document.getElementById('register-form-container');

const loginEmailInput = document.getElementById('loginEmailInput');
const loginPasswordInput = document.getElementById('loginPasswordInput');
const registerNameInput = document.getElementById('registerNameInput');
const registerEmailInput = document.getElementById('registerEmailInput');
const registerPasswordInput = document.getElementById('registerPasswordInput');

const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const googleBtn = document.getElementById('googleBtn');
const logoutBtn = document.getElementById('logoutBtn');
const authError = document.getElementById('auth-error');

const showRegisterLink = document.getElementById('showRegisterLink');
const showLoginLink = document.getElementById('showLoginLink');

const messages = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const statusDiv = document.getElementById('status');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const themeIcon = document.getElementById('themeIcon');
const chatTitle = document.getElementById('chatTitle');
const userAvatar = document.getElementById('userAvatar');

function updateThemeIcon(theme) {
    if (theme === 'dark') {
        themeIcon.className = 'bi bi-sun-fill';
        themeIcon.style.color = '#81c784';
        themeToggleBtn.classList.replace('btn-light', 'btn-dark');
    } else {
        themeIcon.className = 'bi bi-moon-fill';
        themeIcon.style.color = 'var(--primary-color)';
        themeToggleBtn.classList.replace('btn-dark', 'btn-light');
    }
}

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

// Mostrar errores de Auth
function showError(message) {
    authError.textContent = message;
    authError.style.display = 'block';
}

function hideError() {
    authError.style.display = 'none';
}

function translateError(error) {
    switch (error.code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
            return 'Credenciales incorrectas. Revisa tu correo y contraseña.';
        case 'auth/email-already-in-use':
            return 'Este correo ya se encuentra registrado.';
        case 'auth/weak-password':
            return 'La contraseña es muy débil, debe tener al menos 6 caracteres.';
        case 'auth/invalid-email':
            return 'Por favor, ingresa un formato de correo válido.';
        case 'auth/network-request-failed':
            return 'Error de conexión. Revisa tu internet.';
        case 'auth/popup-closed-by-user':
            return 'El usuario cerró la ventana de Google Sign-In.';
        case 'auth/too-many-requests':
            return 'Demasiados intentos fallidos. Intenta más tarde.';
        case 'auth/operation-not-allowed':
            return 'Operación no permitida. Contacta al administrador.';
        case 'auth/account-exists-with-different-credential':
            return 'Ya existe una cuenta con este correo electrónico.';
        default:
            return 'Error: ' + error.message;
    }
}

// Form Toggle Logic
showRegisterLink.addEventListener('click', (e) => {
    e.preventDefault();
    hideError();
    loginFormContainer.style.display = 'none';
    registerFormContainer.style.display = 'block';
});

showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    hideError();
    registerFormContainer.style.display = 'none';
    loginFormContainer.style.display = 'block';
});

// Eventos de Autenticación
loginBtn.addEventListener('click', async () => {
    hideError();
    const email = loginEmailInput.value.trim();
    const password = loginPasswordInput.value.trim();

    if (!email || !password) return showError('Ingresa correo y contraseña');

    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        showError(translateError(error));
    }
});

registerBtn.addEventListener('click', async () => {
    hideError();
    const name = registerNameInput.value.trim();
    const email = registerEmailInput.value.trim();
    const password = registerPasswordInput.value.trim();

    if (!name) return showError('Ingresa tu nombre para registrarte');
    if (!email || !password) return showError('Ingresa correo y contraseña para registrarte');

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, {
            displayName: name
        });
        // Desencadenar la actualización manual de la interfaz (onAuthStateChanged a veces no capta el displayName en la primera vez)
        currentUser = name;
        chatTitle.textContent = currentUser;
        userAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser)}&background=4caf50&color=fff&rounded=true&bold=true`;
    } catch (error) {
        showError(translateError(error));
    }
});

googleBtn.addEventListener('click', async () => {
    hideError();
    try {
        await signInWithPopup(auth, googleProvider);
    } catch (error) {
        showError(translateError(error));
    }
});

logoutBtn.addEventListener('click', async () => {
    if (ws) {
        ws.close();
    }
    await signOut(auth);
});

// Observador de estado de autenticación
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // Usuario logueado
        currentUser = user.displayName || user.email.split('@')[0];
        chatTitle.textContent = currentUser;

        userAvatar.src = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser)}&background=4caf50&color=fff&rounded=true&bold=true`;
        userAvatar.style.display = 'block';

        loginScreen.style.display = 'none';
        chatScreen.style.display = 'flex';

        messages.innerHTML = ''; // Limpiar mensajes anteriores

        // Obtener el JWT para conectarse al WebSocket
        try {
            const token = await getIdToken(user);
            connect(token);
        } catch (error) {
            console.error("Error obteniendo token:", error);
            showError("No se pudo obtener el token de seguridad");
            await signOut(auth);
        }

    } else {
        // Usuario no logueado
        loginScreen.style.display = 'flex';
        chatScreen.style.display = 'none';

        loginEmailInput.value = '';
        loginPasswordInput.value = '';
        registerNameInput.value = '';
        registerEmailInput.value = '';
        registerPasswordInput.value = '';
        hideError();

        if (ws) {
            ws.close();
            ws = null;
        }
    }
});

function connect(token) {
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Se envía el token en la URL para validación
    ws = new WebSocket(`${protocol}//localhost:3000?token=${token}`);

    ws.onopen = () => {
        connected = true;
        statusDiv.textContent = 'Conectado';
        statusDiv.className = 'badge bg-success';
        sendBtn.disabled = false;
        messageInput.focus();
    };

    ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        addMessage(msg.username, msg.text, msg.timestamp);
    };

    ws.onclose = () => {
        connected = false;
        statusDiv.textContent = 'Desconectado';
        statusDiv.className = 'badge bg-danger';
        sendBtn.disabled = true;

        // Intentar reconectar solo si seguimos logueados
        if (auth.currentUser) {
            statusDiv.textContent = 'Reconectando...';
            setTimeout(async () => {
                if (auth.currentUser) {
                    const newToken = await getIdToken(auth.currentUser);
                    connect(newToken);
                }
            }, 3000);
        }
    };

    ws.onerror = (error) => {
        console.error('Error WebSocket:', error);
    };
}

function addMessage(username, text, timestamp) {
    const msgDiv = document.createElement('div');

    const isOwnMessage = username === currentUser;
    msgDiv.className = `message ${isOwnMessage ? 'message-sent' : 'message-received'}`;

    msgDiv.innerHTML = `
        <span class="username">${username}</span> 
        <span class="text">${text}</span>
        <span class="timestamp">${timestamp}</span>
    `;

    messages.appendChild(msgDiv);
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

sendBtn.addEventListener('click', sendMessage);

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Init
initTheme();
