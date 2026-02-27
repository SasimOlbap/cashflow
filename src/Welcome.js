import React, { useEffect, useState } from "react";

export default function Welcome({ onEnter }) {
  const [show, setShow] = useState(false);
  useEffect(() => { setTimeout(() => setShow(true), 100); }, []);

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
      <div style={{
        position: "absolute", top: "20%", left: "15%",
        width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(109,92,224,0.15) 0%, transparent 70%)",
        pointerEvents: "none"
      }} />

      <div style={{
        position: "relative", zIndex: 1, textAlign: "center", maxWidth: 480,
        opacity: show ? 1 : 0, transform: show ? "translateY(0)" : "translateY(20px)",
        transition: "all 0.6s ease"
      }}>
        {/* Logo */}
        <div style={{ marginBottom: 40 }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: "#ffffff", letterSpacing: "-0.5px" }}>
            Cash Flow <span style={{ fontWeight: 300, color: "#a78bfa", fontSize: 14, letterSpacing: "3px", textTransform: "uppercase" }}>Visualizer</span>
          </span>
        </div>

        {/* Badge */}
        <div style={{
          display: "inline-block", padding: "6px 16px", borderRadius: 20, marginBottom: 24,
          background: "rgba(134,239,172,0.1)", border: "1px solid rgba(134,239,172,0.3)",
          fontSize: 12, fontWeight: 700, color: "#86efac", letterSpacing: "2px", textTransform: "uppercase"
        }}>
          ✓ Email verified
        </div>

        <h1 style={{ margin: "0 0 16px", fontSize: 36, fontWeight: 800, color: "#ffffff", letterSpacing: "-1px", lineHeight: 1.2 }}>
          Welcome to<br />
          <span style={{ background: "linear-gradient(135deg, #a78bfa, #6d5ce0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Cash Flow Visualizer
          </span>
        </h1>

        <p style={{ margin: "0 0 40px", fontSize: 16, color: "#a9a9b3", lineHeight: 1.6 }}>
          Your account is ready. Start visualizing your money flow, month by month.
        </p>

        <button
          onClick={onEnter}
          style={{
            background: "linear-gradient(135deg, #6d5ce0, #a78bfa)",
            border: "none", borderRadius: 12, color: "#ffffff",
            fontSize: 16, fontWeight: 700, padding: "16px 40px",
            cursor: "pointer", letterSpacing: "0.3px",
            boxShadow: "0 0 30px rgba(109,92,224,0.4)"
          }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 50px rgba(109,92,224,0.6)"}
          onMouseLeave={e => e.currentTarget.style.boxShadow = "0 0 30px rgba(109,92,224,0.4)"}
        >
          Get started →
        </button>

        <p style={{ margin: "20px 0 0", fontSize: 13, color: "#3d3d5c" }}>
          No credit card required · Free forever plan
        </p>
      </div>
    </div>
  );
}
