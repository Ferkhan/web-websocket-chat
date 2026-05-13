# LabWebAv-WebSocketChat

Aplicación de chat en tiempo real utilizando WebSockets, con autenticación y persistencia de datos mediante Firebase.

## Características

- **Chat en Tiempo Real:** Comunicación bidireccional mediante WebSockets.
- **Autenticación con Firebase:** Soporte para inicio de sesión con Correo/Contraseña y Google Sign-In.
- **Persistencia en Firestore:** Los mensajes se guardan en una base de datos NoSQL y se cargan al iniciar sesión.
- **Seguridad Avanzada:**
  - Validación de conexiones WebSocket mediante **Tokens JWT** de Firebase.
  - Restricción de acceso por **Dominio (CORS)** configurado en el servidor.
- **Interfaz Moderna:** Diseño responsive con Bootstrap 5 y soporte para Modo Oscuro/Claro.

## Arquitectura del Proyecto

El proyecto está dividido en dos microservicios independientes:

### 1. Backend (`/backend`)
Servidor Node.js que gestiona la lógica del chat y la seguridad.
- **Puerto:** 3000
- **Tecnologías:** Express, WebSocket (`ws`), `firebase-admin`, `dotenv`.
- **Responsabilidades:** Validar tokens de seguridad, gestionar conexiones activas, persistir mensajes en Firestore y retransmitir mensajes a los clientes.

### 2. Frontend (`/frontend`)
Servidor Express simple que sirve la interfaz de usuario.
- **Puerto:** 3001
- **Tecnologías:** Vanilla JavaScript (ESM), Bootstrap 5, Firebase SDK (Web).
- **Responsabilidades:** Gestión de la UI, autenticación de usuarios, conexión al WebSocket y visualización del chat.

## Configuración e Instalación

### Requisitos Previos
- Node.js instalado.
- Un proyecto en [Firebase Console](https://console.firebase.google.com/).

### Instalación de Dependencias
Ejecuta el comando en ambas carpetas:
```bash
# En /backend
npm install

# En /frontend
npm install
```

### Variables de Entorno (.env)
En la carpeta `backend/`, crea un archivo `.env` basado en el `.env.example`:
```env
PORT=3000
ALLOWED_ORIGIN=http://localhost:3001
FIREBASE_PROJECT_ID=tu_project_id
FIREBASE_CLIENT_EMAIL=tu_client_email
FIREBASE_PRIVATE_KEY="tu_private_key"
```

### Configuración del SDK (Frontend)
En el archivo `frontend/public/app.js`, actualiza el objeto `firebaseConfig` con las credenciales de tu aplicación web de Firebase.

## Modo de Uso

1. **Iniciar el Backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Iniciar el Frontend:**
   ```bash
   cd frontend
   node index.js
   ```

3. **Acceder:** Abre tu navegador en `http://localhost:3001`.

## Seguridad
Este proyecto implementa un flujo de seguridad robusto:
1. El cliente se autentica en Firebase.
2. El cliente obtiene un `IdToken` (JWT).
3. Al conectar al WebSocket, el token se envía en la URL: `ws://localhost:3000?token=...`.
4. El servidor verifica el token con Firebase Admin SDK antes de aceptar la conexión.
