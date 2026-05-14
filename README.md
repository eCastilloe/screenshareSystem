# ScreenShare P2P

Sistema de compartición de pantalla en tiempo real basado en arquitectura P2P usando WebRTC. Permite que un usuario transmita su pantalla directamente a uno o múltiples espectadores sin que el stream de video pase por el servidor central.

## Arquitectura

```
Cliente A (host)   ──┐
                     ├──  Signaling Server (Node.js + Socket.io)  ──  STUN Server
Cliente B (viewer) ──┘

Video stream: Cliente A  ──────────────────────────────────────►  Cliente B
                                   (P2P directo)
```

El "Signaling Server" solo coordina el establecimiento de la conexión intercambiando mensajes SDP e ICE candidates. El stream de video viaja directamente entre peers sin pasar por el servidor.

## Tecnologías

| Capa | Tecnología |
|---|---|
| Frontend | React + Vite |
| Comunicación en tiempo real | Socket.io |
| Transmisión de video | WebRTC (nativo del navegador) |
| Signaling Server | Node.js + Express |
| Resolución NAT | STUN (stun.l.google.com) |

## Estructura del proyecto

```
screensharesystem/
├── server/
│   ├── index.js          # Signaling server
│   └── package.json
├── client/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── hooks/
│   │   │   └── useWebRTC.js      # Lógica WebRTC
│   │   └── components/
│   │       ├── ShareRoom.jsx     # Vista del host
│   │       └── ViewRoom.jsx      # Vista del espectador
└── └── package.json
```

## Instalación y uso

### Requisitos
- Node.js 18+
- npm

### 1. Clonar el repositorio

```bash
git clone https://github.com/eCastilloe/screenshareSystem
cd screenshareSystem
```

### 2. Instalar dependencias del server

```bash
cd server
npm install
```

### 3. Instalar dependencias del client

```bash
cd ../client
npm install
npm install socket.io-client
```

### 4. Correr en desarrollo

**Terminal 1 — Signaling server:**
```bash
cd server
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
```

Abre `http://iplocal:5173` en el navegador.

## Cómo usarlo

1. Abre la app en el navegador
2. Haz clic en **"Compartir mi pantalla"** — se genera un código de 6 dígitos
3. Comparte ese código con quien quieras que vea tu pantalla
4. El espectador abre la app en navegador, ingresa el código y se conecta directamente

## Conceptos de Sistemas Distribuidos aplicados

- **Comunicación por paso de mensajes** — los peers se coordinan mediante eventos Socket.io sin memoria compartida
- **Separación plano de control / plano de datos** — el signaling server maneja solo metadatos; los datos (video) fluyen de forma descentralizada
- **Tolerancia a múltiples conexiones concurrentes** — el servidor soporta N viewers por sala de forma simultánea
- **Resolución de direcciones en red** — integración con servidor STUN para traversal de NAT


- Frontend: `http://localhost:5173`
- Signaling server: `http://localhost:3001`
