const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

// roomId -> { hostId, viewers: Set }
const rooms = new Map();

app.get("/health", (_, res) => res.json({ status: "ok" }));

io.on("connection", (socket) => {
  console.log("connected:", socket.id);

  // El host crea una sala
  socket.on("create-room", (roomId) => {
    rooms.set(roomId, { hostId: socket.id, viewers: new Set() });
    socket.join(roomId);
    socket.emit("room-created", roomId);
    console.log(`Room created: ${roomId} by ${socket.id}`);
  });

  // Un viewer se une a una sala existente
  socket.on("join-room", (roomId) => {
    const room = rooms.get(roomId);
    if (!room) return socket.emit("error", "Sala no encontrada");

    room.viewers.add(socket.id);
    socket.join(roomId);

    // Le avisa al host que hay un nuevo viewer
    socket.to(room.hostId).emit("viewer-joined", socket.id);
    console.log(`Viewer ${socket.id} joined room ${roomId}`);
  });

  // Relay de SDP offer (host -> viewer específico)
  socket.on("offer", ({ to, offer }) => {
    io.to(to).emit("offer", { from: socket.id, offer });
  });

  // Relay de SDP answer (viewer -> host)
  socket.on("answer", ({ to, answer }) => {
    io.to(to).emit("answer", { from: socket.id, answer });
  });

  // Relay de ICE candidates (cualquier dirección)
  socket.on("ice-candidate", ({ to, candidate }) => {
    io.to(to).emit("ice-candidate", { from: socket.id, candidate });
  });

  // Chat: retransmite mensajes a todos en la sala
  socket.on("chat-message", ({ roomId, text }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    io.to(roomId).emit("chat-message", {
      senderId: socket.id,
      isHost: room.hostId === socket.id,
      text,
    });
  });

  // Limpieza al desconectarse
  socket.on("disconnect", () => {
    rooms.forEach((room, roomId) => {
      if (room.hostId === socket.id) {
        // Host se fue: notifica a todos y elimina la sala
        socket.to(roomId).emit("host-disconnected");
        rooms.delete(roomId);
      } else {
        room.viewers.delete(socket.id);
      }
    });
    console.log("disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Signaling server on port ${PORT}`));