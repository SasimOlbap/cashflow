import React from "react";

export default function CheckEmail({ email }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a0818 0%, #1a0a3a 50%, #0a0818 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Segoe UI', Arial, sans-serif", padding: "20px",
      position: "relative", overflow: "hidden"
    }}>
      {/* Grid background */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "linear-gradient(rgba(167,139,250,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(167,139,250,0.04) 1px, transparent 1px)",
        backgroundSize: "40px 40px"
      }} />
      {/* Glow */}
      <div style={{
        position: "absolute", top: "20%", right: "15%",
        width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(109,92,224,0.15) 0%, transparent 70%)",
        pointerEvents: "none"
      }} />

      <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 480 }}>
        {/* Logo */}
        <div style={{ marginBottom: 40 }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: "#ffffff", letterSpacing: "-0.5px" }}>
            Cash Flow <span style={{ fontWeight: 300, color: "#a78bfa", fontSize: 14, letterSpacing: "3px", textTransform: "uppercase" }}>Visualizer</span>
          </span>
        </div>

        {/* Email icon */}
        <div style={{
          width: 80, height: 80, borderRadius: 20, margin: "0 auto 28px",
          background: "linear-gradient(135deg, #6d5ce0, #a78bfa)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 36, boxShadow: "0 0 40px rgba(109,92,224,0.4)"
        }}>✉️</div>

        <h1 style={{ margin: "0 0 12px", fontSize: 28, fontWeight: 800, color: "#ffffff", letterSpacing: "-0.5px" }}>
          Check your email
        </h1>
        <p style={{ margin: "0 0 8px", fontSize: 16, color: "#a9a9b3", lineHeight: 1.6 }}>
          We sent a verification link to
        </p>
        {email && (
          <p style={{ margin: "0 0 24px", fontSize: 16, fontWeight: 700, color: "#a78bfa" }}>
            {email}
          </p>
        )}
        <p style={{ margin: "0 0 36px", fontSize: 14, color: "#6b6b8a", lineHeight: 1.6 }}>
          Click the link in the email to confirm your account. Check your spam folder if you don't see it.
        </p>

        <button
          onClick={() => window.location.href = "/"}
          style={{
            background: "transparent", border: "1px solid #1f1d3a",
            borderRadius: 10, color: "#a9a9b3", fontSize: 14,
            padding: "12px 28px", cursor: "pointer"
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = "#a78bfa"}
          onMouseLeave={e => e.currentTarget.style.borderColor = "#1f1d3a"}
        >
          ← Back to home
        </button>
      </div>
    </div>
  );
}
