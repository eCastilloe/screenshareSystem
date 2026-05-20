import { useRef, useEffect } from "react";
import Chat from "./Chat";

export default function ViewRoom({ stream, status, messages, onSend }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  if (status === "ended") {
    return (
      <div style={{ fontFamily: "sans-serif" }}>
        <p style={{ textAlign: "center" }}>El host terminó la sesión.</p>
        <Chat messages={messages} onSend={onSend} />
      </div>
    );
  }

  return (
    <div style={{ width: "100%", fontFamily: "sans-serif" }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{ width: "100%", borderRadius: "8px", background: "#000" }}
      />
      <Chat messages={messages} onSend={onSend} />
    </div>
  );
}