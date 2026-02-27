const features = [
  { icon: "◈", title: "Interactive Sankey Diagram", desc: "Watch your money flow visually from income to every expense category in real time." },
  { icon: "◷", title: "12-Month Overview", desc: "Navigate through every month of the year and build a complete picture of your finances." },
  { icon: "⊕", title: "Share & Export", desc: "Share a snapshot of any month via URL, or export your full data as a JSON file." },
  { icon: "☁", title: "Cloud Sync", desc: "Your data is saved securely in the cloud. Access it from any device, any time." },
];

const pricing = [
  {
    name: "Free", price: "$0", period: "forever", highlight: false, cta: "Get Started Free", comingSoon: false,
    features: ["Full Sankey diagram editor", "12 months of data", "Save & Import via JSON", "Share via URL", "Dark / Light mode"],
  },
  {
    name: "Pro", price: "$7", period: "per month", highlight: true, cta: "Coming Soon", comingSoon: true,
    features: ["Everything in Free", "User account + login", "Cloud sync across devices", "Multiple years of data", "Trend charts", "Budget targets", "Export to PDF / CSV"],
  },
  {
    name: "Business", price: "$15", period: "per month", highlight: false, cta: "Coming Soon", comingSoon: true,
    features: ["Everything in Pro", "Multiple financial profiles", "Bank API auto-import", "Shared access & collaboration", "Priority support"],
  },
];

export default function Landing({ onGetStarted }) {
  return (
    <div style={{ fontFamily: "'Georgia', serif", background: "#fafaf8", color: "#1a1a1a", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .cta-btn:hover { opacity: 0.9; transform: translateY(-1px); }
        .cta-btn { transition: opacity 0.2s, transform 0.15s; }
        .sec-btn:hover { background: rgba(255,255,255,0.12) !important; }
        .sec-btn { transition: background 0.2s; }
        .feature-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.08); }
        .feature-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .pricing-card:hover { transform: translateY(-6px); }
        .pricing-card { transition: transform 0.25s ease; }
        .nav-link:hover { color: #c4b5fd; }
        .nav-link { transition: color 0.15s; }
        .fade-in { animation: fadeUp 0.7s ease forwards; opacity: 0; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        .hero-bg {
          background: radial-gradient(ellipse at 80% 20%, rgba(124,58,237,0.35) 0%, transparent 50%),
                      radial-gradient(ellipse at 20% 80%, rgba(79,70,229,0.2) 0%, transparent 50%),
                      #0a0818;
        }
      `}</style>

      {/* Nav */}
      <nav className="hero-bg" style={{ position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "0 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", height: 64 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#fff" }}>Cash Flow</span>
            <span style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "#6b7280", fontFamily: "'DM Sans', sans-serif" }}>Visualizer</span>
          </div>
          <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
            {["Features", "Pricing"].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} className="nav-link" style={{ fontSize: 14, color: "#9ca3af", textDecoration: "none", fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>{l}</a>
            ))}
            <button onClick={onGetStarted} className="cta-btn" style={{ background: "#7c3aed", color: "#fff", border: "none", borderRadius: 8, padding: "8px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
              Get Started Free
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-bg" style={{ position: "relative", padding: "100px 40px 100px", overflow: "hidden" }}>
        {/* decorative orb */}
        <div style={{ position: "absolute", top: "-20%", right: "-5%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-10%", left: "10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(79,70,229,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
        {/* subtle grid lines */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" }} />

        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center", position: "relative" }}>
          <div>
            <div className="fade-in" style={{ animationDelay: "0s", display: "inline-block", background: "rgba(124,58,237,0.2)", color: "#c4b5fd", fontSize: 12, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", padding: "5px 14px", borderRadius: 20, marginBottom: 28, fontFamily: "'DM Sans', sans-serif", border: "1px solid rgba(124,58,237,0.3)" }}>
              Personal Finance · Visual
            </div>
            <h1 className="fade-in" style={{ animationDelay: "0.1s", fontFamily: "'Playfair Display', serif", fontSize: "clamp(36px, 4vw, 58px)", fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: 24, color: "#fff" }}>
              Visualize your money,<br />
              <span style={{ color: "#a78bfa" }}>month by month.</span>
            </h1>
            <p className="fade-in" style={{ animationDelay: "0.2s", fontSize: 17, lineHeight: 1.8, color: "#9ca3af", marginBottom: 40, fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}>
              A beautiful Sankey diagram that shows exactly where your money comes from and where it goes — every single month.
            </p>
            <div className="fade-in" style={{ animationDelay: "0.3s", display: "flex", gap: 12 }}>
              <button onClick={onGetStarted} className="cta-btn" style={{ background: "#7c3aed", color: "#fff", border: "none", borderRadius: 10, padding: "14px 28px", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                Get Started Free →
              </button>
              <button className="sec-btn" style={{ background: "rgba(255,255,255,0.07)", color: "#d1d5db", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "14px 28px", fontSize: 15, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                See how it works
              </button>
            </div>
            <p className="fade-in" style={{ animationDelay: "0.4s", marginTop: 18, fontSize: 13, color: "#6b7280", fontFamily: "'DM Sans', sans-serif" }}>
              No credit card required · Free forever plan
            </p>
          </div>

          {/* Demo card */}
          <div className="fade-in" style={{ animationDelay: "0.2s", background: "#0f0f1a", borderRadius: 16, padding: 24, boxShadow: "0 40px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#7c3aed", marginBottom: 2, fontFamily: "'DM Sans', sans-serif" }}>Financial Overview</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", fontFamily: "'Playfair Display', serif" }}>Cash Flow Visualizer</div>
              </div>
              <div style={{ background: "#1a1a2e", borderRadius: 8, padding: "4px 12px", fontSize: 12, color: "#9ca3af", fontFamily: "'DM Sans', sans-serif" }}>Jan 2026</div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "stretch", height: 160, marginBottom: 12 }}>
              {[
                [{ h: 100, c: "#c4b5fd" }, { h: 35, c: "#818cf8" }, { h: 18, c: "#a78bfa" }],
                [{ h: 100, c: "#c4b5fd" }, { h: 50, c: "#818cf8" }],
                [{ h: 153, c: "#7c3aed" }],
                [{ h: 70, c: "#f472b6" }, { h: 50, c: "#fb7185" }, { h: 33, c: "#e879f9" }],
                [{ h: 60, c: "#fbcfe8" }, { h: 45, c: "#f9a8d4" }, { h: 30, c: "#fca5a5" }, { h: 18, c: "#86efac" }],
              ].map((col, ci) => (
                <div key={ci} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 4 }}>
                  {col.map((b, bi) => (
                    <div key={bi} style={{ height: b.h * 0.85, background: b.c, borderRadius: 4, opacity: 0.85 }} />
                  ))}
                </div>
              ))}
            </div>
            <div style={{ background: "#161625", borderRadius: 8, padding: "8px 14px", display: "flex", gap: 16, fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>
              <span style={{ color: "#6b7280" }}>Income: <strong style={{ color: "#c4b5fd" }}>$5,996</strong></span>
              <span style={{ color: "#6b7280" }}>Expenses: <strong style={{ color: "#fbcfe8" }}>$5,060</strong></span>
              <span style={{ color: "#6b7280" }}>Surplus: <strong style={{ color: "#86efac" }}>$936</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: "80px 40px", background: "#fff", borderTop: "1px solid #e8e4df" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "#7c3aed", marginBottom: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>Features</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(26px, 3vw, 40px)", fontWeight: 700, color: "#0f0f1a", letterSpacing: "-0.02em" }}>
              Everything you need to<br />understand your finances
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
            {features.map((f, i) => (
              <div key={i} className="feature-card" style={{ background: "#fafaf8", border: "1px solid #e8e4df", borderRadius: 14, padding: "28px 22px" }}>
                <div style={{ fontSize: 22, color: "#7c3aed", marginBottom: 12 }}>{f.icon}</div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700, color: "#0f0f1a", marginBottom: 10 }}>{f.title}</h3>
                <p style={{ fontSize: 13, lineHeight: 1.7, color: "#6b7280", fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: "80px 40px", background: "#fafaf8", borderTop: "1px solid #e8e4df" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "#7c3aed", marginBottom: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>Pricing</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(26px, 3vw, 40px)", fontWeight: 700, color: "#0f0f1a", letterSpacing: "-0.02em" }}>
              Simple, transparent pricing
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {pricing.map((p, i) => (
              <div key={i} className="pricing-card" style={{
                background: p.highlight ? "#0f0f1a" : "#fff",
                border: p.highlight ? "2px solid #7c3aed" : "1px solid #e8e4df",
                borderRadius: 16, padding: "32px 28px", position: "relative",
              }}>
                {p.highlight && (
                  <div style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)", background: p.comingSoon ? "#4b5563" : "#7c3aed", color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "4px 16px", borderRadius: 20, fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap" }}>
                    {p.comingSoon ? "Coming Soon" : "Most Popular"}
                  </div>
                )}
                {p.comingSoon && !p.highlight && (
                  <div style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)", background: "#4b5563", color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "4px 16px", borderRadius: 20, fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap" }}>
                    Coming Soon
                  </div>
                )}
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: p.highlight ? "#9ca3af" : "#6b7280", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>{p.name}</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                    <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 38, fontWeight: 900, color: p.highlight ? "#fff" : "#0f0f1a", filter: p.comingSoon ? "blur(6px)" : "none", userSelect: p.comingSoon ? "none" : "auto" }}>{p.price}</span>
                    <span style={{ fontSize: 13, color: p.highlight ? "#6b7280" : "#9ca3af", fontFamily: "'DM Sans', sans-serif", filter: p.comingSoon ? "blur(4px)" : "none" }}>/{p.period}</span>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 28 }}>
                  {p.features.map((f, fi) => (
                    <div key={fi} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                      <span style={{ color: p.comingSoon ? "#6b7280" : "#7c3aed", fontSize: 13 }}>✓</span>
                      <span style={{ fontSize: 13, color: p.highlight ? "#d1d5db" : "#4b5563", lineHeight: 1.5, fontFamily: "'DM Sans', sans-serif" }}>{f}</span>
                    </div>
                  ))}
                </div>
                <button disabled={p.comingSoon} onClick={!p.comingSoon ? onGetStarted : undefined} style={{
                  width: "100%",
                  background: p.comingSoon ? (p.highlight ? "#2d2d3a" : "#f3f4f6") : (p.highlight ? "#7c3aed" : "#fff"),
                  color: p.comingSoon ? "#6b7280" : (p.highlight ? "#fff" : "#4b5563"),
                  border: p.highlight ? "none" : "1px solid #e8e4df",
                  borderRadius: 10, padding: "11px", fontSize: 14, fontWeight: 600,
                  cursor: p.comingSoon ? "not-allowed" : "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                }}>
                  {p.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section style={{ padding: "80px 40px", background: "#0f0f1a", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(26px, 3vw, 40px)", fontWeight: 900, color: "#fff", marginBottom: 16, letterSpacing: "-0.02em" }}>
            Start for free today.
          </h2>
          <p style={{ fontSize: 15, color: "#6b7280", marginBottom: 32, fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}>
            No credit card required. Set up in under a minute.
          </p>
          <button onClick={onGetStarted} className="cta-btn" style={{ background: "#7c3aed", color: "#fff", border: "none", borderRadius: 10, padding: "16px 36px", fontSize: 16, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
            Get Started Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: "24px 40px", background: "#0a0a12", borderTop: "1px solid #1f1f35" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: "#4b5563" }}>Cash Flow Visualizer</span>
          <span style={{ fontSize: 13, color: "#4b5563", fontFamily: "'DM Sans', sans-serif" }}>© 2026 · All rights reserved</span>
        </div>
      </footer>
    </div>
  );
}
