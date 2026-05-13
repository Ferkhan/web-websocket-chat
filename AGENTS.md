# OpenCode Instructions for LabWebAv-WebSocketChat

## Architecture & Boundaries
This is a WebSocket chat application split into two separate Node.js projects (it does not use a monorepo workspace tool).

- **`backend/`**: Express server running on port `3000` with the `ws` package for WebSockets. Entrypoint is `backend/index.js`.
- **`frontend/`**: Express server running on port `3001` that serves static files from `frontend/public/`. Entrypoint is `frontend/index.js`.

## Running the Application
Since there is no root package/workspace, you must run and manage dependencies for the servers independently.

**Start the Backend (Port 3000):**
```bash
cd backend
npm run dev # Uses `node --watch` for auto-reloads
```

**Start the Frontend (Port 3001):**
*Note: The frontend `package.json` does not have start scripts.*
```bash
cd frontend
node index.js
```

## Development Quirks
- The frontend uses **Vanilla JS and Bootstrap 5 (via CDN)**. There is no bundler (like Webpack, Vite) or framework (like React/Vue) used here.
- Frontend modifications should be made directly in `frontend/public/index.html`, `frontend/public/app.js`, and `frontend/public/styles.css`.
- Core application requirements (as outlined in `requerimientos.md`) include:
  - Separate login and chat views toggled via JS (`display: none`).
  - Strict message alignment (own messages on the left, received on the right).
  - Dark/Light mode toggling relying on Bootstrap 5's `data-bs-theme` attribute.
