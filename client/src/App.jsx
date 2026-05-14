import { useState } from "react";
import { useWebRTC } from "./hooks/useWebRTC";
import ShareRoom from "./components/ShareRoom";
import ViewRoom from "./components/ViewRoom";

export default function App() {
  const [inputCode, setInputCode] = useState("");
  const { startSharing, joinRoom, stopSharing, roomId, remoteStream, viewers, status } = useWebRTC();

  if (status === "hosting") {
    return <ShareRoom roomId={roomId} viewers={viewers} onStop={stopSharing} />;
  }

  if (status === "viewing" || status === "ended") {
    return <ViewRoom stream={remoteStream} status={status} />;
  }

  return (
    <div style={{ maxWidth: "400px", margin: "4rem auto", textAlign: "center", fontFamily: "sans-serif" }}>
      <h1>ScreenShare P2P</h1>

      <button onClick={startSharing} style={{
        width: "100%", padding: "1rem", marginBottom: "2rem",
        background: "#3182ce", color: "white", border: "none",
        borderRadius: "8px", fontSize: "1rem", cursor: "pointer"
      }}>
        Compartir mi pantalla
      </button>

      <hr />
      <p>¿Tienes un código?</p>
      <input
        value={inputCode}
        onChange={(e) => setInputCode(e.target.value.toUpperCase())}
        placeholder="Ej: A3X9KL"
        maxLength={6}
        style={{
          width: "100%", padding: "0.75rem", fontSize: "1.5rem",
          letterSpacing: "0.3rem", textAlign: "center",
          border: "1px solid #ccc", borderRadius: "8px", marginBottom: "1rem",
          boxSizing: "border-box"
        }}
      />
      <button
        onClick={() => joinRoom(inputCode)}
        disabled={inputCode.length < 6}
        style={{
          width: "100%", padding: "1rem", background: "#38a169",
          color: "white", border: "none", borderRadius: "8px",
          fontSize: "1rem", cursor: "pointer", opacity: inputCode.length < 6 ? 0.5 : 1
        }}
      >
        Unirme
      </button>
    </div>
  );
}