# Plan de Mejoras del Chat WebSocket

## 1. Separación de Archivos (Modularización)
*   **Acción**: Extraer el código CSS y JavaScript que actualmente vive dentro de `index.html` a sus propios archivos.
*   **Nuevos Archivos**: Se crearán `frontend/public/styles.css` y `frontend/public/app.js`.
*   **Resultado**: `index.html` quedará mucho más limpio, únicamente con la estructura, e importará los recursos externos mediante `<link>` y `<script src="...">`.

## 2. Pantalla de Bienvenida (Ingreso de Usuario)
*   **Acción**: Modificar el HTML para tener dos vistas principales (contenedores `div` separados):
    1.  **Pantalla de Login (`#login-screen`)**: Contendrá un título, el campo para ingresar el `username` y un botón de "Entrar".
    2.  **Pantalla de Chat (`#chat-screen`)**: Contendrá la interfaz de mensajes, inicialmente oculta (`display: none`).
*   **Lógica JS**: El JavaScript interceptará el evento de "Entrar", validará que el usuario no esté vacío, guardará el nombre en una variable global y ocultará la pantalla de login para mostrar la del chat, estableciendo la conexión WebSocket en ese momento.

## 3. Integración de Bootstrap, Diseño Responsivo y Colores Propios
*   **Acción**: Añadir Bootstrap 5 (vía CDN) al `index.html` para asegurar un diseño *responsive* (adaptable a móviles y escritorio).
*   **Estructura UI**: Usar componentes de Bootstrap como `Container`, `Card` (para el marco del chat), `Form-control` y `Button` para darle un aspecto moderno.
*   **Diseño Personalizado**: Aplicar estilos y colores personalizados a través del archivo `styles.css` para sobrescribir y personalizar Bootstrap, dándole una estética atractiva.

## 4. Acumulación y Alineación de Mensajes (Estricto)
*   **Acción**: Se modificará la función `addMessage` en `app.js` para diferenciar quién envía el mensaje, comparando el remitente con el `username` ingresado al inicio. Los mensajes se acumularán con scroll.
*   **Alineación**: 
    *   **Mensajes Propios**: Alineados a la **izquierda** (usando clases personalizadas/Bootstrap).
    *   **Mensajes Recibidos**: Alineados a la **derecha**.

## 5. Modo Claro y Oscuro (Dark/Light Mode)
*   **Acción**: Añadir un interruptor (Toggle Switch) en la barra superior o cabecera de la aplicación.
*   **Lógica**: Aprovechar el sistema nativo de Bootstrap 5.3 (`data-bs-theme="dark"`) en combinación con CSS personalizado en `styles.css` y un evento en `app.js` que escuche el click en el interruptor para alternar entre temas de forma fluida (colores de fondo, texto y burbujas de chat).