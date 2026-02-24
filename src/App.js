import { useState, useEffect, useRef } from "react";
import { buildLayout } from "./buildLayout";
import { LinkPath, ItemRow, SankeyNode } from "./components";
import { useDrag } from "./useDrag";
import { darkTheme, lightTheme } from "./theme";
import {
  uid, fmt, pct,
  INIT_INCOME, INIT_EXPENSES, CATS, CAT_COLORS,
  GROUP_COLORS, LINK_LEFT, LINK_RIGHT,
} from "./constants";

export default function CashFlow() {
  // ── refs & size ───────────────────────────────────────────────────────────
  const svgRef = useRef(null);
  const [svgW, setSvgW] = useState(600);
  const [svgH, setSvgH] = useState(440);

  useEffect(() => {
    const obs = new ResizeObserver(entries => {
      const w = entries[0].contentRect.width;
      setSvgW(w); setSvgH(Math.max(320, w * 0.53));
    });
    if (svgRef.current) obs.observe(svgRef.current);
    return () => obs.disconnect();
  }, []);

  // ── state ─────────────────────────────────────────────────────────────────
  const [darkMode,  setDarkMode]  = useState(true);
  const [hovered,   setHovered]   = useState(null);
  const [income,    setIncome]    = useState(() => {
    try { const s = localStorage.getItem("cf_income");   return s ? JSON.parse(s) : INIT_INCOME;   } catch { return INIT_INCOME; }
  });
  const [expenses,  setExpenses]  = useState(() => {
    try { const s = localStorage.getItem("cf_expenses"); return s ? JSON.parse(s) : INIT_EXPENSES; } catch { return INIT_EXPENSES; }
  });
  const [niLabel,   setNiLabel]   = useState("");
  const [niType,    setNiType]    = useState("active");
  const [neLabel,   setNeLabel]   = useState("");
  const [neCat,     setNeCat]     = useState("Living");

  // Auto-save to localStorage whenever data changes
  useEffect(() => { try { localStorage.setItem("cf_income",   JSON.stringify(income));   } catch {} }, [income]);
  useEffect(() => { try { localStorage.setItem("cf_expenses", JSON.stringify(expenses)); } catch {} }, [expenses]);

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

  // ── layout ────────────────────────────────────────────────────────────────
  const { nodes, links, nodeWidth, grand, totalExp, surplus } = buildLayout(income, expenses, svgW, svgH, colOffsets);

  // Recompute link sx/tx after drag offsets are baked in
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
  const cardSt = { background: T.bgCard, borderRadius: 14, padding: "14px 16px",
    border: `1px solid ${T.border}`, display: "flex", flexDirection: "column", gap: 0, transition: "background 0.3s" };
  const inpSt  = { flex: 1, minWidth: 0, background: T.bgInput, border: `1px solid ${T.borderInput}`,
    borderRadius: 6, color: T.textNode, fontSize: 15, padding: "5px 7px", outline: "none" };
  const selSt  = { background: T.bgInput, border: `1px solid ${T.borderInput}`, borderRadius: 6,
    color: T.selText, fontSize: 15, padding: "5px 7px", outline: "none" };
  const btnSt  = { background: T.btnBg, border: "none", borderRadius: 6, color: T.btnText,
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
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", background: T.bg, minHeight: "100vh",
      padding: "24px 18px", color: T.text, boxSizing: "border-box", transition: "background 0.3s, color 0.3s" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase", color: T.accent, marginBottom: 4 }}>Financial Overview</div>
              <h1 style={{ fontSize: "clamp(22px,3vw,34px)", fontWeight: 700, margin: "0 0 8px", letterSpacing: "-0.02em" }}>Monthly Cash Flow</h1>
            </div>
            <button onClick={() => setDarkMode(d => !d)} style={{
              background: T.btnBg, border: `1px solid ${T.border}`, borderRadius: 20,
              padding: "6px 14px", cursor: "pointer", color: T.btnText,
              fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6,
              transition: "all 0.2s", flexShrink: 0, marginTop: 4,
            }}>
              {darkMode ? "☀️ Light" : "🌙 Dark"}
            </button>
          </div>
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "baseline" }}>
            <span style={{ fontSize: 16, color: T.textMuted }}>Income: <strong style={{ color: "#c4b5fd" }}>${Number(grand).toLocaleString()}</strong></span>
            <span style={{ fontSize: 16, color: T.textMuted }}>Expenses: <strong style={{ color: "#fbcfe8" }}>${Number(totalExp).toLocaleString()}</strong></span>
            <span style={{ fontSize: 16, color: T.textMuted }}>
              {surplus >= 0
                ? <><strong style={{ color: "#86efac" }}>Surplus</strong>{": "}<strong style={{ color: "#86efac" }}>${surplus.toLocaleString()}</strong></>
                : <><strong style={{ color: "#f87171" }}>Deficit</strong>{": "}<strong style={{ color: "#f87171" }}>${Math.abs(surplus).toLocaleString()}</strong></>
              }
            </span>
          </div>
        </div>

        {/* Sankey */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
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
            display: "flex", alignItems: "center", transition: "background 0.3s" }}>
            {hovLink ? (
              <span>
                <span style={{ color: T.textDim, textTransform: "uppercase", fontSize: 11, letterSpacing: "0.1em" }}>Flow · </span>
                <strong style={{ color: "#c4b5fd" }}>{hovLink.sourceNode.label} → {hovLink.targetNode.label}</strong>
                <span style={{ color: T.textDim }}> · ${hovLink.value.toLocaleString()} ({pct(hovLink.value, grand)})</span>
              </span>
            ) : (
              <span style={{ color: T.textFaint }}>Hover over an Item to see details</span>
            )}
          </div>
        </div>

        {/* Editor */}
        <div style={{ display: "flex", gap: 14, marginTop: 16, alignItems: "flex-start", flexWrap: "wrap" }}>

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
                onKeyDown={e => e.key === "Enter" && addEx()} style={inpSt} />
              <select value={neCat} onChange={e => setNeCat(e.target.value)} style={selSt}>
                {CATS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <button onClick={addEx} style={btnSt}>+ Add</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
