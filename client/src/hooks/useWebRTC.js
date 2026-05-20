import { useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";

const SIGNAL_URL = import.meta.env.VITE_SIGNAL_URL || window.location.origin;

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export function useWebRTC() {
  const socketRef = useRef(null);
  const connectionsRef = useRef({});
  const localStreamRef = useRef(null);
  const currentRoomIdRef = useRef(null);

  const [roomId, setRoomId] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [viewers, setViewers] = useState(0);
  const [status, setStatus] = useState("idle");
  const [messages, setMessages] = useState([]);

  // Conecta el socket una sola vez
  const getSocket = useCallback(() => {
    if (!socketRef.current) {
      socketRef.current = io(SIGNAL_URL);
    }
    return socketRef.current;
  }, []);

  // Crea una RTCPeerConnection ya configurada con todos sus listeners
  const createPeerConnection = useCallback((viewerId, localStream) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

    pc.onicecandidate = ({ candidate }) => {
      if (candidate) {
        getSocket().emit("ice-candidate", { to: viewerId, candidate });
      }
    };

    pc.onconnectionstatechange = () => {
      console.log(`Connection to ${viewerId}:`, pc.connectionState);
    };

    return pc;
  }, [getSocket]);

  // HOST: captura pantalla y crea sala
  const startSharing = useCallback(async () => {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: { frameRate: 30 },
      audio: true,
    });
    localStreamRef.current = stream;

    const id = Math.random().toString(36).slice(2, 8).toUpperCase();
    const socket = getSocket();

    socket.emit("create-room", id);
    socket.on("room-created", () => {
      currentRoomIdRef.current = id;
      setRoomId(id);
      setStatus("hosting");
    });

    socket.on("chat-message", ({ senderId, text, isHost }) => {
      setMessages((msgs) => [...msgs, { text, isOwn: senderId === socket.id, isHost }]);
    });

    // Cuando llega un viewer, el host inicia la oferta
    socket.on("viewer-joined", async (viewerId) => {
      setViewers((v) => v + 1);
      const pc = createPeerConnection(viewerId, stream);
      connectionsRef.current[viewerId] = pc;

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("offer", { to: viewerId, offer });
    });

    socket.on("answer", async ({ from, answer }) => {
      const pc = connectionsRef.current[from];
      if (pc && pc.signalingState === "have-local-offer") {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    socket.on("ice-candidate", async ({ from, candidate }) => {
      const pc = connectionsRef.current[from];
      if (pc) await pc.addIceCandidate(new RTCIceCandidate(candidate));
    });

    // Si el usuario detiene la captura desde el browser
    stream.getVideoTracks()[0].onended = stopSharing;
  }, [getSocket, createPeerConnection]);

  // VIEWER: se une a una sala
  const joinRoom = useCallback(async (id) => {
    const socket = getSocket();
    currentRoomIdRef.current = id;
    socket.emit("join-room", id);

    socket.on("chat-message", ({ senderId, text, isHost }) => {
      setMessages((msgs) => [...msgs, { text, isOwn: senderId === socket.id, isHost }]);
    });

    socket.on("error", (msg) => {
      setStatus("idle");
      alert(msg);
    });

    socket.on("offer", async ({ from, offer }) => {
      const pc = new RTCPeerConnection(ICE_SERVERS);
      connectionsRef.current[from] = pc;

      pc.ontrack = ({ streams }) => {
        setRemoteStream(streams[0]);
        setStatus("viewing");
      };

      pc.onicecandidate = ({ candidate }) => {
        if (candidate) socket.emit("ice-candidate", { to: from, candidate });
      };

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("answer", { to: from, answer });
    });

    socket.on("ice-candidate", async ({ from, candidate }) => {
      const pc = connectionsRef.current[from];
      if (pc) await pc.addIceCandidate(new RTCIceCandidate(candidate));
    });

    socket.on("host-disconnected", () => {
      setRemoteStream(null);
      setStatus("ended");
    });
  }, [getSocket]);

  const stopSharing = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    Object.values(connectionsRef.current).forEach((pc) => pc.close());
    connectionsRef.current = {};
    socketRef.current?.disconnect();
    socketRef.current = null;
    currentRoomIdRef.current = null;
    setStatus("idle");
    setRoomId(null);
    setViewers(0);
    setMessages([]);
  }, []);

  const sendMessage = useCallback((text) => {
    getSocket().emit("chat-message", { roomId: currentRoomIdRef.current, text });
  }, [getSocket]);

  return { startSharing, joinRoom, stopSharing, roomId, remoteStream, viewers, status, messages, sendMessage };
}