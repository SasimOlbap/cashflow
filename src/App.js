import { useState, useEffect, useRef, Component } from "react";
import { buildLayout } from "./buildLayout";
import { LinkPath, ItemRow, SankeyNode } from "./components";
import { useDrag } from "./useDrag";
import { darkTheme, lightTheme } from "./theme";
import { supabase } from "./supabase";
import Landing from "./Landing";
import CheckEmail from "./CheckEmail";
import Welcome from "./Welcome";
import {
  uid, fmt, pct,
  INIT_INCOME, INIT_EXPENSES, CATS, CAT_COLORS,
  GROUP_COLORS, LINK_LEFT, LINK_RIGHT,
} from "./constants";

// ── error boundary ────────────────────────────────────────────────────────────
class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { crashed: false }; }
  static getDerivedStateFromError() { return { crashed: true }; }
  render() {
    if (this.state.crashed) return (
      <div style={{ padding: 40, textAlign: "center", fontFamily: "sans-serif" }}>
        <h2>Something went wrong 😅</h2>
        <p>Try refreshing the page.</p>
        <button onClick={() => window.location.reload()}
          style={{ padding: "8px 20px", cursor: "pointer", borderRadius: 8, border: "none", background: "#7c3aed", color: "#fff", fontSize: 15 }}>
          Refresh
        </button>
      </div>
    );
    return this.props.children;
  }
}

// ── month helpers ─────────────────────────────────────────────────────────────
const toKey  = (y, m) => `${y}-${String(m).padStart(2, "0")}`;
const today   = new Date();
const initKey = toKey(today.getFullYear(), 1);

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const loadMonths = () => {
  try {
    const s = localStorage.getItem("cf_months");
    if (s) return JSON.parse(s);
  } catch {}
  const empty = { income: [], expenses: [] };
  const result = {};
  for (let i = 1; i <= 12; i++) result[toKey(today.getFullYear(), i)] = empty;
  result[initKey] = { income: INIT_INCOME, expenses: INIT_EXPENSES };
  return result;
};

export default function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [checkEmail, setCheckEmail] = useState(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const isNewSignup = useRef(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === "SIGNED_IN" && isNewSignup.current) {
        setShowWelcome(true);
        isNewSignup.current = false;
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  if (authLoading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#0f0f1a" }}>
      <div style={{ color: "#c4b5fd", fontSize: 18 }}>Loading...</div>
    </div>
  );

  if (showWelcome && session) return <Welcome onEnter={() => setShowWelcome(false)} />;
  if (session) return <ErrorBoundary><CashFlow session={session} /></ErrorBoundary>;
  if (checkEmail) return <CheckEmail email={checkEmail} />;
  if (showAuth) return <ErrorBoundary><AuthScreen mode={authMode} onCheckEmail={(email) => setCheckEmail(email)} onNewSignup={() => { isNewSignup.current = true; }} /></ErrorBoundary>;
  return <Landing onGetStarted={() => { setAuthMode("signup"); setShowAuth(true); }} onLogin={() => { setAuthMode("login"); setShowAuth(true); }} />;
}

// ── auth screen ───────────────────────────────────────────────────────────────
function AuthScreen({ onCheckEmail, mode, onNewSignup }) {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [isLogin,  setIsLogin]  = useState(mode !== "signup");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async () => {
    setError(""); setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setError(error.message);
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) setError(error.message);
        else { onNewSignup(); onCheckEmail(email); }
      }
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", fontFamily: "'DM Sans','Segoe UI',sans-serif", position: "relative", overflow: "hidden",
      background: "radial-gradient(ellipse at 80% 20%, rgba(124,58,237,0.35) 0%, transparent 50%), radial-gradient(ellipse at 20% 80%, rgba(79,70,229,0.2) 0%, transparent 50%), #0a0818"
    }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "-20%", right: "-5%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-10%", left: "10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(79,70,229,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "relative", zIndex: 1, background: "#161625", border: "1px solid #2d2b55", borderRadius: 16, padding: "40px 36px", width: 360 }}>
        <div style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#7c3aed", marginBottom: 8 }}>Financial Overview</div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#fff", margin: "0 0 4px", letterSpacing: "-0.02em" }}>Cash Flow Visualizer</h1>
        <p style={{ color: "#6b7280", fontSize: 14, margin: "0 0 28px" }}>{isLogin ? "Log in to your account" : "Create a new account"}</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            type="email" placeholder="Email" value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ background: "#0f0f1a", border: "1px solid #2d2b55", borderRadius: 8, color: "#fff", fontSize: 14, padding: "10px 14px", outline: "none" }}
          />
          <input
            type="password" placeholder="Password" value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            style={{ background: "#0f0f1a", border: "1px solid #2d2b55", borderRadius: 8, color: "#fff", fontSize: 14, padding: "10px 14px", outline: "none" }}
          />
          {error && <div style={{ color: "#f87171", fontSize: 13 }}>{error}</div>}
          <button onClick={handleSubmit} disabled={loading} style={{
            background: "#7c3aed", border: "none", borderRadius: 8, color: "#fff",
            fontSize: 15, fontWeight: 600, padding: "11px", cursor: "pointer", marginTop: 4,
          }}>
            {loading ? "..." : isLogin ? "Log In" : "Sign Up"}
          </button>
          <button onClick={() => { setIsLogin(l => !l); setError(""); }} style={{
            background: "transparent", border: "none", color: "#9ca3af", fontSize: 13, cursor: "pointer", padding: 4,
          }}>
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CashFlow({ session }) {
  // ── refs & size ───────────────────────────────────────────────────────────
  const svgRef = useRef(null);
  const [svgW, setSvgW] = useState(600);
  const [svgH, setSvgH] = useState(440);

  useEffect(() => {
    const obs = new ResizeObserver(entries => {
      const w = entries[0].contentRect.width;
      setSvgW(w); setSvgH(Math.max(320, w * 0.59));
    });
    if (svgRef.current) obs.observe(svgRef.current);
    return () => obs.disconnect();
  }, []);

  // ── state ─────────────────────────────────────────────────────────────────
  const [darkMode,  setDarkMode]  = useState(true);
  const [hovered,   setHovered]   = useState(null);
  const [months,    setMonths]    = useState(loadMonths);
  const [curKey,    setCurKey]    = useState(initKey);
  const [hovMonth,  setHovMonth]  = useState(null);
  const [niLabel,   setNiLabel]   = useState("");
  const [niType,    setNiType]    = useState("active");
  const [neLabel,   setNeLabel]   = useState("");
  const [neCat,     setNeCat]     = useState("Living");

  // ── cloud sync ────────────────────────────────────────────────────────────
  // Load all months from Supabase on mount
  useEffect(() => {
    const loadFromCloud = async () => {
      const year = today.getFullYear();

      // Clear localStorage first so previous user's data doesn't leak
      try { localStorage.removeItem("cf_months"); } catch {}

      const { data, error } = await supabase
        .from("cashflow")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("year", year);

      if (error) return;

      // Start with clean empty months
      const empty = { income: [], expenses: [] };
      const freshMonths = {};
      for (let i = 1; i <= 12; i++) freshMonths[toKey(year, i)] = empty;
      freshMonths[initKey] = { income: INIT_INCOME, expenses: INIT_EXPENSES };

      // Overlay with cloud data if any exists
      if (data?.length) {
        data.forEach(row => {
          freshMonths[toKey(year, row.month)] = { income: row.income, expenses: row.expenses };
        });
      }

      setMonths(freshMonths);
    };
    loadFromCloud();
  }, [session.user.id]);

  // Save current month to Supabase whenever it changes
  useEffect(() => {
    const saveToCloud = async () => {
      const [y, m] = curKey.split("-").map(Number);
      const cur = months[curKey];
      if (!cur) return;
      await supabase.from("cashflow").upsert({
        user_id: session.user.id,
        year: y, month: m,
        income: cur.income,
        expenses: cur.expenses,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id,year,month" });
    };
    saveToCloud();
  }, [months, curKey, session.user.id]);

  // Auto-save to localStorage as fallback
  useEffect(() => {
    try { localStorage.setItem("cf_months", JSON.stringify(months)); } catch {}
  }, [months]);

  // Current month data
  const displayKey = hovMonth || curKey;
  const curData    = months[displayKey] || { income: [], expenses: [] };
  const income     = curData.income;
  const expenses   = curData.expenses;
  const isEmpty    = income.length === 0 && expenses.length === 0;

  const setIncome   = fn => setMonths(p => ({ ...p, [curKey]: { ...p[curKey], income:   fn(p[curKey]?.income   || []) } }));
  const setExpenses = fn => setMonths(p => ({ ...p, [curKey]: { ...p[curKey], expenses: fn(p[curKey]?.expenses || []) } }));

  const copyFromPrev = () => {
    const [y, m] = curKey.split("-").map(Number);
    const prevKey = m === 1 ? toKey(y - 1, 12) : toKey(y, m - 1);
    const prev = months[prevKey];
    if (!prev) return;
    setMonths(p => ({ ...p, [curKey]: {
      income:   prev.income.map(i   => ({ ...i, id: uid() })),
      expenses: prev.expenses.map(e => ({ ...e, id: uid() })),
    }}));
  };
  const [y, m] = curKey.split("-").map(Number);
  const prevKey = m === 1 ? toKey(y - 1, 12) : toKey(y, m - 1);
  const hasPrev = !!(months[prevKey]?.income?.length || months[prevKey]?.expenses?.length);

  const T = darkMode ? darkTheme : lightTheme;
  const { colOffsets, startDrag } = useDrag(svgRef, svgW);

  // ── data handlers ─────────────────────────────────────────────────────────
  const updInLabel = (id, v) => setIncome(p => p.map(i => i.id === id ? { ...i, label: v } : i));
  const updInValue = (id, v) => setIncome(p => p.map(i => i.id === id ? { ...i, value: v } : i));
  const remIn      = id      => setIncome(p => p.filter(i => i.id !== id));
  const addIn = () => {
    if (!niLabel.trim()) return;
    setIncome(p => [...p, { id: uid(), label: niLabel.trim(), value: 0, type: niType }]);
    setNiLabel("");
  };

  const updExLabel = (id, v) => setExpenses(p => p.map(e => e.id === id ? { ...e, label: v } : e));
  const updExValue = (id, v) => setExpenses(p => p.map(e => e.id === id ? { ...e, value: v } : e));
  const remEx      = id      => setExpenses(p => p.filter(e => e.id !== id));
  const addEx = () => {
    if (!neLabel.trim()) return;
    setExpenses(p => [...p, { id: uid(), label: neLabel.trim(), value: 0, category: neCat }]);
    setNeLabel("");
  };

  // ── save / import / share ─────────────────────────────────────────────────
  const importRef = useRef(null);
  const [shareCopied, setShareCopied] = useState(false);

  const handleSave = () => {
    const data = JSON.stringify(months, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `cashflow-${today.getFullYear()}.json`;
    a.click(); URL.revokeObjectURL(url);
  };

  const handleImport = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const parsed = JSON.parse(ev.target.result);
        setMonths(parsed);
      } catch { alert("Invalid file format."); }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleShare = () => {
    try {
      const encoded = btoa(encodeURIComponent(JSON.stringify(months[curKey])));
      const url = `${window.location.origin}${window.location.pathname}?month=${curKey}&data=${encoded}`;
      navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch {}
  };

  // Load shared data from URL on mount
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const data = params.get("data");
      const month = params.get("month");
      if (data && month) {
        const parsed = JSON.parse(decodeURIComponent(atob(data)));
        setMonths(p => ({ ...p, [month]: parsed }));
        setCurKey(month);
        window.history.replaceState({}, "", window.location.pathname);
      }
    } catch {}
  }, []);
  let layoutResult = { nodes: [], links: [], nodeWidth: 14, grand: 0, totalExp: 0, surplus: 0 };
  try {
    layoutResult = buildLayout(income, expenses, svgW, svgH, colOffsets);
  } catch {}
  const { nodes, links, nodeWidth, grand, totalExp, surplus } = layoutResult;

  const nodeMapD = {};
  nodes.forEach(n => { nodeMapD[n.id] = n; });
  links.forEach(l => {
    const s = nodeMapD[l.source], t = nodeMapD[l.target];
    if (s && t) { l.sx = s.x + (s.w || nodeWidth); l.tx = t.x; }
  });

  const getLinkColor = link => {
    const col = link.sourceNode?.col ?? 0;
    if (link.source === "__deficit_src" || link.source === "__deficit_agg" ||
        link.target === "__deficit_agg" || (link.target === "__total" && link.source === "__deficit_agg"))
      return "#f87171";
    if (col <= 1) return LINK_LEFT[Math.min(col, 1)];
    if (link.source === "__surplus" || link.target === "__surplus" || link.target === "__surplus_leaf")
      return "#86efac";
    const idx = CATS.findIndex(c => link.source === "__cat_" + c);
    return idx >= 0 ? LINK_RIGHT[idx] : "#c4b5fd";
  };

  const hovLink = hovered ? links.find(l => l.source + "-" + l.target === hovered) : null;

  // ── shared styles ─────────────────────────────────────────────────────────
  const cardSt  = { background: T.bgCard, borderRadius: 14, padding: "14px 16px",
    border: `1px solid ${T.border}`, display: "flex", flexDirection: "column", gap: 0, transition: "background 0.3s" };
  const inpSt   = { flex: 1, minWidth: 0, background: T.bgInput, border: `1px solid ${T.borderInput}`,
    borderRadius: 6, color: T.textNode, fontSize: 15, padding: "5px 7px", outline: "none" };
  const selSt   = { background: T.bgInput, border: `1px solid ${T.borderInput}`, borderRadius: 6,
    color: T.selText, fontSize: 15, padding: "5px 7px", outline: "none" };
  const btnSt   = { background: T.btnBg, border: "none", borderRadius: 6, color: T.btnText,
    fontSize: 15, padding: "5px 10px", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 };
  const subHead = label => (
    <div style={{ fontSize: 13, letterSpacing: "0.13em", textTransform: "uppercase",
      color: T.textSub, margin: "10px 0 5px" }}>{label}</div>
  );
  const colHead = (label, total, color) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
      <span style={{ fontSize: 14, letterSpacing: "0.14em", textTransform: "uppercase", color: T.accentHead }}>{label}</span>
      <span style={{ fontSize: 19, fontWeight: 700, color }}>${Number(total).toLocaleString()}</span>
    </div>
  );

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", background: darkMode
        ? `radial-gradient(ellipse at 80% 20%, rgba(124,58,237,0.18) 0%, transparent 50%), radial-gradient(ellipse at 20% 80%, rgba(79,70,229,0.12) 0%, transparent 50%), ${T.bg}`
        : `radial-gradient(ellipse at 80% 20%, rgba(124,58,237,0.08) 0%, transparent 50%), radial-gradient(ellipse at 20% 80%, rgba(139,92,246,0.06) 0%, transparent 50%), ${T.bg}`, minHeight: "100vh",
      padding: "24px 18px", color: T.text, boxSizing: "border-box", transition: "background 0.3s, color 0.3s", position: "relative" }}>
      <div style={{ position: "fixed", inset: 0, backgroundImage: darkMode ? "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)" : "linear-gradient(rgba(124,58,237,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.04) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "relative", zIndex: 1 }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
              <div style={{ fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase", color: T.accent, marginBottom: 4 }}>Financial Overview</div>
              <h1 style={{ fontSize: "clamp(22px,3vw,34px)", fontWeight: 700, margin: "0", letterSpacing: "-0.02em" }}>Cash Flow Visualizer</h1>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
              <div style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>
                <input ref={importRef} type="file" accept=".json" onChange={handleImport} style={{ display: "none" }} />
                <div style={{ display: "flex", border: `1px solid ${T.border}`, borderRadius: 10, overflow: "hidden" }}>
                  {[
                    { label: "↓ Save",   onClick: handleSave },
                    { label: "↑ Import", onClick: () => importRef.current?.click() },
                    { label: "⊕ Share",  onClick: handleShare, active: shareCopied },
                  ].map((btn, i) => (
                    <button key={i} onClick={btn.onClick} style={{
                      background: btn.active ? "#16a34a" : T.bgCard,
                      border: "none",
                      borderLeft: i > 0 ? `1px solid ${T.border}` : "none",
                      color: btn.active ? "#fff" : T.text,
                      fontSize: 13, fontWeight: 500,
                      padding: "6px 14px",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      transition: "background 0.2s",
                    }}>
                      {btn.active ? "✓ Copied!" : btn.label}
                    </button>
                  ))}
                </div>
                <button onClick={() => supabase.auth.signOut()} style={{
                  background: T.btnBg, border: `1px solid ${T.border}`, borderRadius: 10,
                  padding: "6px 14px", cursor: "pointer", color: T.btnText,
                  fontSize: 13, fontWeight: 500, transition: "all 0.2s", flexShrink: 0,
                }}>
                  Sign Out
                </button>
                <button onClick={() => setDarkMode(d => !d)} style={{
                  background: T.btnBg, border: `1px solid ${T.border}`, borderRadius: 10,
                  padding: "6px 14px", cursor: "pointer", color: T.btnText,
                  fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 6,
                  transition: "all 0.2s", flexShrink: 0,
                }}>
                  {darkMode ? "☀️ Light" : "🌙 Dark"}
                </button>
              </div>
              <button onClick={copyFromPrev} style={{
                background: "#7c3aed", border: "none", borderRadius: 20,
                padding: "6px 14px", cursor: "pointer", color: "#fff",
                fontSize: 13, fontWeight: 600, whiteSpace: "nowrap",
                visibility: (isEmpty && hasPrev) ? "visible" : "hidden",
              }}>
                Copy from previous month
              </button>
            </div>
          </div>
        </div>

        {/* Sankey + Month Sidebar */}
        <div style={{ display: "flex", gap: 10, alignItems: "stretch" }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
            <div ref={svgRef} style={{ background: T.bgCard, borderRadius: 14, padding: "12px 8px", border: `1px solid ${T.border}`, transition: "background 0.3s" }}>
              <svg width="100%" height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} style={{ overflow: "visible" }}>
                {links.map(l => (
                  <LinkPath key={l.source + "-" + l.target} link={l} color={getLinkColor(l)} onHover={setHovered} hovered={hovered} />
                ))}
                {nodes.map(n => (
                  <SankeyNode key={n.id} n={n} nodeWidth={nodeWidth} T={T}
                    GROUP_COLORS={GROUP_COLORS} grand={grand} fmt={fmt} pct={pct} startDrag={startDrag} />
                ))}
              </svg>
            </div>

            {/* Tooltip */}
            <div style={{ background: T.bgCard, borderRadius: 10, height: 46, padding: "8px 14px",
              border: `1px solid ${T.border}`, fontSize: 14, color: T.textNode,
              display: "flex", alignItems: "center", justifyContent: "space-between", transition: "background 0.3s" }}>
              <div style={{ display: "flex", gap: 18, alignItems: "baseline" }}>
                <span style={{ fontSize: 14, color: T.textMuted }}>Income: <strong style={{ color: "#c4b5fd" }}>${Number(grand).toLocaleString()}</strong></span>
                <span style={{ fontSize: 14, color: T.textMuted }}>Expenses: <strong style={{ color: "#fbcfe8" }}>${Number(totalExp).toLocaleString()}</strong></span>
                <span style={{ fontSize: 14, color: T.textMuted }}>
                  {surplus >= 0
                    ? <><strong style={{ color: "#86efac" }}>Surplus</strong>{": "}<strong style={{ color: "#86efac" }}>${surplus.toLocaleString()}</strong></>
                    : <><strong style={{ color: "#f87171" }}>Deficit</strong>{": "}<strong style={{ color: "#f87171" }}>${Math.abs(surplus).toLocaleString()}</strong></>}
                </span>
              </div>
              <div>
                {hovLink ? (
                  <span>
                    <span style={{ color: T.textDim, textTransform: "uppercase", fontSize: 11, letterSpacing: "0.1em" }}>Flow · </span>
                    <strong style={{ color: "#c4b5fd" }}>{hovLink.sourceNode.label} → {hovLink.targetNode.label}</strong>
                    <span style={{ color: T.textDim }}> · ${hovLink.value.toLocaleString()} ({pct(hovLink.value, grand)})</span>
                  </span>
                ) : (
                  <span style={{ color: T.textFaint }}>Hover over an item to see details</span>
                )}
              </div>
            </div>
          </div>

          {/* Month sidebar */}
          <div style={{ display: "flex", flexDirection: "column", width: 52,
            background: T.bgCard, borderRadius: 14, padding: "10px 6px",
            border: `1px solid ${T.border}`, transition: "background 0.3s",
            justifyContent: "flex-start", gap: 0 }}>
            {MONTH_NAMES.map((name, i) => {
              const key = toKey(today.getFullYear(), i + 1);
              const isSelected = key === curKey;
              const isHovered = key === hovMonth;
              const hasData = !!(months[key]?.income?.length || months[key]?.expenses?.length);
              return (
                <button key={key}
                  onClick={() => {
                    if (!months[key]) setMonths(p => ({ ...p, [key]: { income: [], expenses: [] } }));
                    setCurKey(key);
                    setHovMonth(null);
                  }}
                  onMouseEnter={() => hasData && setHovMonth(key)}
                  onMouseLeave={() => setHovMonth(null)}
                  style={{
                    background: isSelected || isHovered ? T.bgCard : "transparent",
                    border: isSelected ? `1px solid ${T.border}` : isHovered ? `1px solid ${T.accent}44` : "1px solid transparent",
                    borderRadius: 8,
                    color: isSelected || isHovered ? "#c4b5fd" : hasData ? T.text : T.textFaint,
                    fontSize: 13,
                    fontWeight: isSelected || isHovered ? 700 : 400,
                    padding: "6px 4px",
                    cursor: "pointer",
                    textAlign: "center",
                    opacity: isSelected || isHovered ? 1 : hasData ? 0.8 : 0.35,
                    transition: "all 0.15s",
                  }}>
                  {name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Editor */}
        <div style={{ display: "flex", gap: 14, marginTop: 10, alignItems: "flex-start", flexWrap: "wrap" }}>

          {/* Income */}
          <div style={{ ...cardSt, flex: 1, minWidth: 240 }}>
            {colHead("Income", grand, "#c4b5fd")}
            {subHead("Active")}
            {income.filter(i => i.type === "active").map(item => (
              <ItemRow key={item.id} item={item} accent="#818cf8" T={T}
                onLabel={v => updInLabel(item.id, v)} onValue={v => updInValue(item.id, v)} onRemove={() => remIn(item.id)} />
            ))}
            {subHead("Passive")}
            {income.filter(i => i.type === "passive").map(item => (
              <ItemRow key={item.id} item={item} accent="#a78bfa" T={T}
                onLabel={v => updInLabel(item.id, v)} onValue={v => updInValue(item.id, v)} onRemove={() => remIn(item.id)} />
            ))}
            <div style={{ display: "flex", gap: 5, marginTop: 12, flexWrap: "wrap" }}>
              <input placeholder="New item…" value={niLabel} onChange={e => setNiLabel(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addIn()} style={inpSt} />
              <select value={niType} onChange={e => setNiType(e.target.value)} style={selSt}>
                <option value="active">Active</option>
                <option value="passive">Passive</option>
              </select>
              <button onClick={addIn} style={btnSt}>+ Add</button>
            </div>
          </div>

          {/* Expenses */}
          <div style={{ ...cardSt, flex: 1, minWidth: 240 }}>
            {colHead("Expenses", totalExp, "#fbcfe8")}
            {CATS.map(cat => (
              <div key={cat}>
                {subHead(cat)}
                {expenses.filter(e => e.category === cat).map(item => (
                  <ItemRow key={item.id} item={item} accent={CAT_COLORS[cat]} T={T}
                    onLabel={v => updExLabel(item.id, v)} onValue={v => updExValue(item.id, v)} onRemove={() => remEx(item.id)} />
                ))}
              </div>
            ))}
            <div style={{ display: "flex", gap: 5, marginTop: 12, flexWrap: "wrap" }}>
              <input placeholder="New item…" value={neLabel} onChange={e => setNeLabel(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addEx()} style={selSt} />
              <select value={neCat} onChange={e => setNeCat(e.target.value)} style={selSt}>
                {CATS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <button onClick={addEx} style={btnSt}>+ Add</button>
            </div>
          </div>

        </div>
      </div>
      </div>
    </div>
  );
}
