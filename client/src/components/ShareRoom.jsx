import { useRef, useEffect } from "react";

export default function ShareRoom({ roomId, viewers, onStop }) {
  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h2>Compartiendo pantalla</h2>
      <p>Comparte este código con quien quieras que vea tu pantalla:</p>
      <div style={{
        fontSize: "3rem", fontWeight: "bold", letterSpacing: "0.5rem",
        padding: "1rem 2rem", background: "#f0f0f0", borderRadius: "12px",
        display: "inline-block", margin: "1rem 0"
      }}>
        {roomId}
      </div>
      <p>{viewers} viewer{viewers !== 1 ? "s" : ""} conectado{viewers !== 1 ? "s" : ""}</p>
      <button onClick={onStop} style={{
        background: "#e53e3e", color: "white", border: "none",
        padding: "0.75rem 2rem", borderRadius: "8px", fontSize: "1rem", cursor: "pointer"
      }}>
        Detener
      </button>
    </div>
  );
}