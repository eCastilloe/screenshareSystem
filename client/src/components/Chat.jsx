import { useState, useRef, useEffect } from "react";

export default function Chat({ messages, onSend }) {
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
  };

  return (
    <div style={{
      border: "1px solid #ddd", borderRadius: "8px",
      maxWidth: "600px", margin: "1rem auto", fontFamily: "sans-serif",
      background: "white",
    }}>
      <div style={{ padding: "0.5rem 0.75rem", borderBottom: "1px solid #ddd", fontWeight: "bold", fontSize: "0.9rem" }}>
        Chat
      </div>
      <div style={{
        height: "220px", overflowY: "auto", padding: "0.75rem",
        display: "flex", flexDirection: "column", gap: "0.5rem",
      }}>
        {messages.length === 0 && (
          <p style={{ color: "#aaa", textAlign: "center", margin: "auto" }}>
            No hay mensajes aún
          </p>
        )}
        {messages.map((msg, i) => (
          <div key={i} style={{
            alignSelf: msg.isOwn ? "flex-end" : "flex-start",
            background: msg.isOwn ? "#3182ce" : "#f0f0f0",
            color: msg.isOwn ? "white" : "#333",
            padding: "0.4rem 0.75rem",
            borderRadius: "12px",
            maxWidth: "80%",
            wordBreak: "break-word",
          }}>
            {!msg.isOwn && (
              <div style={{ fontSize: "0.7rem", marginBottom: "0.15rem", opacity: 0.6 }}>
                {msg.isHost ? "Anfitrión" : "Espectador"}
              </div>
            )}
            {msg.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div style={{ display: "flex", borderTop: "1px solid #ddd" }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Escribe un mensaje..."
          style={{
            flex: 1, padding: "0.6rem 0.75rem", border: "none",
            outline: "none", fontSize: "0.9rem", borderRadius: "0 0 0 8px",
          }}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          style={{
            padding: "0.6rem 1rem", background: "#3182ce", color: "white",
            border: "none", cursor: "pointer", borderRadius: "0 0 8px 0",
            opacity: !text.trim() ? 0.5 : 1,
          }}
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
