require('dotenv').config();
const express = require('express');
const WebSocket = require('ws');
const admin = require('firebase-admin');
const url = require('url');

// Inicializar Firebase Admin
try {
	admin.initializeApp({
		credential: admin.credential.cert({
			projectId: process.env.FIREBASE_PROJECT_ID,
			clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
			// Replace escaped newlines if any
			privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
		}),
	});
	console.log('✅ Firebase Admin inicializado');
} catch (error) {
	console.error('❌ Error inicializando Firebase Admin. Verifica tu .env:', error.message);
}

const db = admin.apps.length > 0 ? admin.firestore() : null;

const app = express();
const port = process.env.PORT || 3000;
const allowedOrigin = process.env.ALLOWED_ORIGIN;

// Servir archivos estáticos
app.use(express.static('public'));

const server = app.listen(port, () => {
	console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});

// Función de validación de conexión WebSocket
const verifyClient = async (info, callback) => {
	const origin = info.origin || info.req.headers.origin;

	// 1. Validar CORS
	if (origin !== allowedOrigin) {
		console.warn(`Conexión rechazada por origen no permitido: ${origin}`);
		return callback(false, 403, 'Forbidden: Origin not allowed');
	}

	// 2. Extraer y validar el Token JWT de Firebase
	const parsedUrl = url.parse(info.req.url, true);
	const token = parsedUrl.query.token;

	if (!token) {
		console.warn('Conexión rechazada: Token no proporcionado');
		return callback(false, 401, 'Unauthorized: Token missing');
	}

	try {
		// Verificar el token con Firebase
		if (admin.apps.length > 0) {
			const decodedToken = await admin.auth().verifyIdToken(token);
			info.req.user = decodedToken; 
			callback(true); // Conexión permitida
		} else {
			// Si admin no está inicializado, rechazamos temporalmente
			console.warn('Conexión rechazada: Firebase Admin no inicializado');
			callback(false, 500, 'Internal Server Error');
		}
	} catch (error) {
		console.error('Error validando token:', error.message);
		callback(false, 401, 'Unauthorized: Invalid token');
	}
};

// Crear servidor WebSocket con validación
const wss = new WebSocket.Server({ server, verifyClient });

// Almacenar conexiones activas
const clients = new Set();

wss.on('connection', async (ws, req) => {
	clients.add(ws);
	const username = req.user?.name || req.user?.email || 'Usuario';
	console.log(`Cliente conectado (${username}). Total: ${clients.size}`);

	// Al conectarse, enviar el historial de mensajes desde Firestore
	try {
		if (db) {
			const messagesSnapshot = await db.collection('messages')
				.orderBy('timestamp', 'asc')
				.limit(50)
				.get();

			messagesSnapshot.forEach(doc => {
				const data = doc.data();
				// Solo enviar a este cliente
				ws.send(JSON.stringify({
					username: data.username,
					text: data.text,
					timestamp: data.timeString || (data.timestamp ? new Date(data.timestamp.toDate()).toLocaleTimeString() : new Date().toLocaleTimeString())
				}));
			});
		}
	} catch (error) {
		console.error('Error cargando historial:', error);
	}

	ws.on('message', async (data) => {
		try {
			const messageData = JSON.parse(data);
			const timeString = new Date().toLocaleTimeString();
			
			// Guardar el mensaje en Firestore
			if (db) {
				await db.collection('messages').add({
					username: messageData.username,
					text: messageData.text,
					timestamp: admin.firestore.FieldValue.serverTimestamp(),
					timeString: timeString
				});
			}

			const outMsg = JSON.stringify({
				username: messageData.username,
				text: messageData.text,
				timestamp: timeString
			});

			// Reenviar mensaje a todos los clientes conectados
			clients.forEach((client) => {
				if (client.readyState === WebSocket.OPEN) {
					client.send(outMsg);
				}
			});
		} catch (error) {
			console.error('Error procesando mensaje:', error);
		}
	});

	ws.on('close', () => {
		clients.delete(ws);
		console.log(`Cliente desconectado (${username}). Total: ${clients.size}`);
	});

	ws.on('error', (error) => {
		console.error('Error WebSocket:', error);
		clients.delete(ws);
	});
});
