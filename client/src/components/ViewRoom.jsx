import { useRef, useEffect } from "react";

export default function ViewRoom({ stream, status }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  if (status === "ended") {
    return <p style={{ textAlign: "center" }}>El host terminó la sesión.</p>;
  }

  return (
    <div style={{ width: "100%" }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{ width: "100%", borderRadius: "8px", background: "#000" }}
      />
    </div>
  );
}