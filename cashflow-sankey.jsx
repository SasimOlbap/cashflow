import { useState, useEffect, useRef } from "react";

// ── helpers ────────────────────────────────────────────────────────────────
function fmt(v) { return v >= 1000 ? (v / 1000).toFixed(1) + "K" : String(Math.round(v)); }
function pct(v, total) { return total === 0 ? "0.0%" : ((v / total) * 100).toFixed(1) + "%"; }
let _uid = 1;
const uid = () => String(_uid++);

// ── initial data ───────────────────────────────────────────────────────────
const INIT_INCOME = [
  { id: uid(), label: "Monthly Wage",    value: 5300, type: "active"  },
  { id: uid(), label: "Cashback Reward", value: 287,  type: "passive" },
  { id: uid(), label: "Stock Dividends", value: 262,  type: "passive" },
  { id: uid(), label: "Bank Interest",   value: 147,  type: "passive" },
];
const INIT_EXPENSES = [
  { id: uid(), label: "Federal Tax",             value: 494, category: "Payroll"    },
  { id: uid(), label: "Public Welfare",           value: 677, category: "Payroll"    },
  { id: uid(), label: "Utilities & Bills",        value: 758, category: "Living"     },
  { id: uid(), label: "Groceries",                value: 933, category: "Living"     },
  { id: uid(), label: "Personal Hygiene",         value: 649, category: "Living"     },
  { id: uid(), label: "Commuting",                value: 825, category: "Living"     },
  { id: uid(), label: "Retirement Savings",       value: 536, category: "Long-Term"  },
  { id: uid(), label: "Investment Contributions", value: 392, category: "Long-Term"  },
  { id: uid(), label: "Real Estate Fund",         value: 287, category: "Long-Term"  },
  { id: uid(), label: "Flexible Spending",        value: 409, category: "Flexible"   },
];

const CATS = ["Payroll", "Living", "Long-Term", "Flexible"];
const CAT_COLORS  = { Payroll: "#fde68a", Living: "#fbcfe8", "Long-Term": "#bfdbfe", Flexible: "#d9f99d" };
const GROUP_COLORS = { source: "#a78bfa", agg: "#818cf8", total: "#6366f1", category: "#c4b5fd", leaf: "#d8b4fe", surplus: "#86efac", deficit: "#f87171" };
const LINK_LEFT   = ["#c4b5fd", "#a78bfa"];
const LINK_RIGHT  = ["#fde68a", "#fbcfe8", "#bfdbfe", "#d9f99d"];

// ── build layout ───────────────────────────────────────────────────────────
function buildLayout(income, expenses, width, height, colOffsets = [0,0,0,0,0]) {
  const active  = income.filter(i => i.type === "active");
  const passive = income.filter(i => i.type === "passive");
  const activeSum  = active.reduce((s, i)  => s + (Number(i.value) || 0), 0);
  const passiveSum = passive.reduce((s, i) => s + (Number(i.value) || 0), 0);
  const grand = activeSum + passiveSum;

  const catSums = {};
  CATS.forEach(c => { catSums[c] = expenses.filter(e => e.category === c).reduce((s, e) => s + (Number(e.value) || 0), 0); });
  const totalExp = CATS.reduce((s, c) => s + catSums[c], 0);
  const surplus = grand - totalExp; // positive = surplus, negative = deficit
  const deficit = surplus < 0 ? Math.abs(surplus) : 0;

  // The "total" node must equal what flows through it.
  // If deficit: total = totalExp (income + borrowed deficit)
  // If surplus: total = grand
  const totalNodeVal = deficit > 0 ? totalExp : grand;

  const nodes = [];
  const push = (id, label, value, group) => nodes.push({ id, label, value: value || 0, group });

  // Deficit source node appears on the left alongside income sources
  if (deficit > 0) push("__deficit_src", "Deficit", deficit, "source");
  active.forEach(i  => push(i.id, i.label, Number(i.value) || 0, "source"));
  passive.forEach(i => push(i.id, i.label, Number(i.value) || 0, "source"));
  if (activeSum  > 0) push("__active",  "Active Income",  activeSum,  "agg");
  if (passiveSum > 0) push("__passive", "Passive Income", passiveSum, "agg");
  if (deficit > 0)    push("__deficit_agg", "Deficit", deficit, "agg");
  push("__total", "Income " + fmt(grand), totalNodeVal, "total");
  CATS.forEach(c => {
    if (catSums[c] > 0) {
      const label = c === "Payroll" ? "Payroll Deductions" : c === "Living" ? "Living Costs" : c === "Long-Term" ? "Long-Term Planning" : "Flexible Spending";
      push("__cat_" + c, label, catSums[c], "category");
    }
  });
  if (surplus > 0) push("__surplus", "Surplus", surplus, "category");
  expenses.forEach(e => { if ((Number(e.value) || 0) > 0) push(e.id, e.label, Number(e.value) || 0, "leaf"); });
  if (surplus > 0) push("__surplus_leaf", "Surplus", surplus, "leaf");

  const links = [];
  const addLink = (s, t, v) => { if (v > 0) links.push({ source: s, target: t, value: v }); };
  if (deficit > 0) addLink("__deficit_src", "__deficit_agg", deficit);
  active.forEach(i  => { if (activeSum  > 0) addLink(i.id, "__active",  Number(i.value) || 0); });
  passive.forEach(i => { if (passiveSum > 0) addLink(i.id, "__passive", Number(i.value) || 0); });
  if (activeSum  > 0) addLink("__active",  "__total", activeSum);
  if (passiveSum > 0) addLink("__passive", "__total", passiveSum);
  if (deficit > 0)    addLink("__deficit_agg", "__total", deficit);
  CATS.forEach(c => { if (catSums[c] > 0) addLink("__total", "__cat_" + c, catSums[c]); });
  if (surplus > 0) addLink("__total", "__surplus", surplus);
  expenses.forEach(e => {
    const v = Number(e.value) || 0;
    if (v > 0 && catSums[e.category] > 0) addLink("__cat_" + e.category, e.id, v);
  });
  if (surplus > 0) addLink("__surplus", "__surplus_leaf", surplus);

  const colMap = { source: 0, agg: 1, total: 2, category: 3, leaf: 4 };
  const nodeMap = {};
  nodes.forEach(n => { n.col = colMap[n.group]; nodeMap[n.id] = n; });

  // Per-column node widths: wide at edges, narrow in center (hourglass effect)
  const colWidths = [20, 14, 10, 14, 20]; // source, agg, total, category, leaf
  const nodeWidth = 14; // fallback
  nodes.forEach(n => { n.w = colWidths[n.col]; });

  // Reserve space for labels on both sides, then place columns symmetrically
  const labelPad = 120; // space for left/right labels
  const inner = width - labelPad * 2;
  const baseColX = [
    labelPad - 0.03 * inner,   // source (shifted left slightly)
    labelPad + 0.20 * inner,   // agg (shifted left)
    labelPad + 0.42 * inner,   // total
    labelPad + 0.58 * inner,   // category
    labelPad + 1.00 * inner,   // leaf
  ];
  // Apply drag offsets to get actual positions
  const actualColX = baseColX.map((x, i) => x + (colOffsets[i] || 0));
  nodes.forEach(n => { n.x = actualColX[n.col]; });

  // Dynamic height scale: columns closer to center (total) get compressed
  // Left side (cols 0,1) scale based on distance from center independently of right side
  // Right side (cols 3,4) scale based on distance from center independently of left side
  const centerX = actualColX[2];
  const maxDistLeft  = Math.max(...[0,1].map(i => Math.abs(actualColX[i] - centerX))) || 1;
  const maxDistRight = Math.max(...[3,4].map(i => Math.abs(actualColX[i] - centerX))) || 1;
  const getHeightScale = (ci) => {
    if (ci === 2) return 0.80; // center always 80%
    const maxDist = ci < 2 ? maxDistLeft : maxDistRight;
    const dist = Math.abs(actualColX[ci] - centerX);
    const t = dist / maxDist;
    return 0.80 + 0.20 * t;
  };

  const buckets = [[], [], [], [], []];
  nodes.forEach(n => buckets[n.col].push(n));
  const gap = 8;
  buckets.forEach((col, ci) => {
    const tot = col.reduce((s, n) => s + n.value, 0);
    if (!tot) return;
    const scaledH = height * getHeightScale(ci);
    const avail = scaledH - gap * Math.max(0, col.length - 1);
    let y = 0;
    col.forEach(n => { n.h = Math.max(4, (n.value / tot) * avail); n.y = y; y += n.h + gap; });
    const off = (height - (y - gap)) / 2;
    col.forEach(n => { n.y += off; });
  });

  const srcOff = {}, tgtOff = {};
  nodes.forEach(n => { srcOff[n.id] = 0; tgtOff[n.id] = 0; });
  links.forEach(l => {
    const s = nodeMap[l.source], t = nodeMap[l.target];
    if (!s || !t) return;
    const sh = s.value > 0 ? (l.value / s.value) * s.h : 0;
    const th = t.value > 0 ? (l.value / t.value) * t.h : 0;
    l.sy0 = s.y + srcOff[s.id]; l.sy1 = l.sy0 + sh;
    l.ty0 = t.y + tgtOff[t.id]; l.ty1 = l.ty0 + th;
    l.sx = s.x + (s.w || nodeWidth); l.tx = t.x;
    l.sourceNode = s; l.targetNode = t;
    srcOff[s.id] += sh; tgtOff[t.id] += th;
  });

  return { nodes, links, nodeWidth, grand, catSums, totalExp, surplus };
}

// ── subcomponents ──────────────────────────────────────────────────────────
function LinkPath({ link, color, onHover, hovered }) {
  const { sx, tx, sy0, sy1, ty0, ty1 } = link;
  const mx = (sx + tx) / 2;
  const d = `M${sx},${sy0} C${mx},${sy0} ${mx},${ty0} ${tx},${ty0} L${tx},${ty1} C${mx},${ty1} ${mx},${sy1} ${sx},${sy1} Z`;
  const key = link.source + "-" + link.target;
  return (
    <path d={d} fill={color} opacity={hovered === key ? 0.85 : 0.4}
      style={{ transition: "opacity 0.15s", cursor: "pointer" }}
      onMouseEnter={() => onHover(key)} onMouseLeave={() => onHover(null)} />
  );
}

function ItemRow({ item, accent, onLabel, onValue, onRemove }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
      <div style={{ width: 3, height: 34, borderRadius: 2, background: accent, flexShrink: 0 }} />
      <input value={item.label} onChange={e => onLabel(e.target.value)}
        style={{ flex: 1, minWidth: 0, background: "#0a0916", border: "1px solid #2a2840",
          borderRadius: 6, color: "#d4d4f7", fontSize: 15, padding: "4px 7px", outline: "none" }} />
      <div style={{ position: "relative", flexShrink: 0 }}>
        <span style={{ position: "absolute", left: 7, top: "50%", transform: "translateY(-50%)", color: "#6b6b8a", fontSize: 15, pointerEvents: "none" }}>$</span>
        <input type="number" min="0" value={item.value} onChange={e => onValue(e.target.value)}
          style={{ width: 86, background: "#0a0916", border: "1px solid #2a2840",
            borderRadius: 6, color: "#a78bfa", fontSize: 15, padding: "4px 6px 4px 18px", outline: "none" }} />
      </div>
      <button onClick={onRemove}
        style={{ background: "none", border: "none", color: "#3d3d5c", cursor: "pointer", fontSize: 19, padding: "0 2px", lineHeight: 1 }}
        onMouseEnter={e => (e.currentTarget.style.color = "#ff6b6b")}
        onMouseLeave={e => (e.currentTarget.style.color = "#3d3d5c")}>×</button>
    </div>
  );
}

// ── main ───────────────────────────────────────────────────────────────────
export default function CashFlow() {
  const svgRef = useRef(null);
  const [svgW, setSvgW] = useState(600);
  const [svgH, setSvgH] = useState(440);
  const [hovered, setHovered]   = useState(null);
  const [income,   setIncome]   = useState(INIT_INCOME);
  const [expenses, setExpenses] = useState(INIT_EXPENSES);
  const [niLabel, setNiLabel]   = useState("");
  const [niType,  setNiType]    = useState("active");
  const [neLabel, setNeLabel]   = useState("");
  const [neCat,   setNeCat]     = useState("Living");
  const [colOffsets, setColOffsets] = useState([0, 0, 0, 0, 0]);
  const dragRef = useRef(null);

  useEffect(() => {
    const obs = new ResizeObserver(entries => {
      const w = entries[0].contentRect.width;
      setSvgW(w); setSvgH(Math.max(360, w * 0.6));
    });
    if (svgRef.current) obs.observe(svgRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const onMove = e => {
      if (!dragRef.current) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const dx = clientX - dragRef.current.startX;
      const svgEl = svgRef.current ? svgRef.current.querySelector("svg") : null;
      const scale = svgEl ? svgW / svgEl.getBoundingClientRect().width : 1;
      setColOffsets(prev => {
        const next = [...prev];
        next[dragRef.current.col] = dragRef.current.startOffset + dx * scale;
        return next;
      });
    };
    const onUp = () => { dragRef.current = null; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [svgW]);

  const startDrag = (col, e) => {
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    dragRef.current = { col, startX: clientX, startOffset: colOffsets[col] };
  };

  const { nodes, links, nodeWidth, grand, totalExp, surplus } = buildLayout(income, expenses, svgW, svgH, colOffsets);

  // Recompute link sx/tx after drag offsets (already baked into node.x inside buildLayout)
  const nodeMapD = {};
  nodes.forEach(n => { nodeMapD[n.id] = n; });
  links.forEach(l => {
    const s = nodeMapD[l.source], t = nodeMapD[l.target];
    if (!s || !t) return;
    l.sx = s.x + (s.w || nodeWidth); l.tx = t.x;
  });

  const getLinkColor = link => {
    const col = link.sourceNode?.col ?? 0;
    if (link.source === "__deficit_src" || link.source === "__deficit_agg" || link.target === "__deficit_agg" || (link.target === "__total" && link.source === "__deficit_agg")) return "#f87171";
    if (col <= 1) return LINK_LEFT[Math.min(col, 1)];
    if (link.source === "__surplus" || link.target === "__surplus" || link.target === "__surplus_leaf") return "#86efac";
    const idx = CATS.findIndex(c => link.source === "__cat_" + c);
    return idx >= 0 ? LINK_RIGHT[idx] : "#c4b5fd";
  };

  const hovLink = hovered ? links.find(l => l.source + "-" + l.target === hovered) : null;

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

  const colStyle = {
    background: "#16152a", borderRadius: 14, padding: "16px 14px",
    border: "1px solid #2d2b4e", display: "flex", flexDirection: "column", gap: 0,
  };
  const inpSt = {
    flex: 1, minWidth: 0, background: "#0a0916", border: "1px solid #2a2840",
    borderRadius: 6, color: "#d4d4f7", fontSize: 15, padding: "5px 7px", outline: "none",
  };
  const selSt = {
    background: "#0a0916", border: "1px solid #2a2840", borderRadius: 6,
    color: "#a78bfa", fontSize: 15, padding: "5px 7px", outline: "none",
  };
  const btnSt = {
    background: "#2d2b4e", border: "none", borderRadius: 6, color: "#c4b5fd",
    fontSize: 15, padding: "5px 10px", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
  };
  const subHead = label => (
    <div style={{ fontSize: 13, letterSpacing: "0.13em", textTransform: "uppercase", color: "#4b4b6a", margin: "10px 0 5px" }}>
      {label}
    </div>
  );
  const colHead = (label, total, color) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
      <span style={{ fontSize: 14, letterSpacing: "0.14em", textTransform: "uppercase", color: "#6b6b8a" }}>{label}</span>
      <span style={{ fontSize: 19, fontWeight: 700, color }}>${Number(total).toLocaleString()}</span>
    </div>
  );

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", background: "#0f0e17", minHeight: "100vh", padding: "24px 18px", color: "#fffffe", boxSizing: "border-box" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase", color: "#a78bfa", marginBottom: 4 }}>Financial Overview</div>
          <h1 style={{ fontSize: "clamp(22px,3vw,34px)", fontWeight: 700, margin: "0 0 8px", letterSpacing: "-0.02em" }}>Monthly Cash Flow</h1>
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "baseline" }}>
            <span style={{ fontSize: 16, color: "#a9a9b3" }}>Income: <strong style={{ color: "#c4b5fd" }}>${Number(grand).toLocaleString()}</strong></span>
            <span style={{ fontSize: 16, color: "#a9a9b3" }}>Expenses: <strong style={{ color: "#fbcfe8" }}>${Number(totalExp).toLocaleString()}</strong></span>
            <span style={{ fontSize: 16, color: "#a9a9b3" }}>
              {surplus >= 0
                ? <><strong style={{ color: "#86efac" }}>Surplus</strong>{": "}<strong style={{ color: "#86efac" }}>${surplus.toLocaleString()}</strong></>
                : <><strong style={{ color: "#f87171" }}>Deficit</strong>{": "}<strong style={{ color: "#f87171" }}>${Math.abs(surplus).toLocaleString()}</strong></>
              }
            </span>
          </div>
        </div>

        {/* Sankey */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div ref={svgRef} style={{ background: "#16152a", borderRadius: 14, padding: "12px 8px", border: "1px solid #2d2b4e" }}>
            <svg width="100%" height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} style={{ overflow: "visible" }}>
              {links.map(l => (
                <LinkPath key={l.source + "-" + l.target} link={l} color={getLinkColor(l)} onHover={setHovered} hovered={hovered} />
              ))}
              {nodes.map(n => {
                const isSurplus = n.id === "__surplus" || n.id === "__surplus_leaf";
                const isDeficit = n.id === "__deficit_src" || n.id === "__deficit_agg";
                const c = isDeficit ? GROUP_COLORS.deficit : isSurplus ? GROUP_COLORS.surplus : GROUP_COLORS[n.group];
                const right = n.col >= 3;
                const nw = n.w || nodeWidth;
                const lx = right ? n.x + nw + 6 : n.x - 6;
                const anchor = right ? "start" : "end";
                const my = n.y + n.h / 2;
                const fs = Math.min(11, Math.max(7, n.h * 0.26));
                return (
                  <g key={n.id}>
                    <rect x={n.x} y={n.y} width={nw} height={n.h} fill={c} rx={3}
                      style={{ filter: `drop-shadow(0 0 3px ${c}88)`, cursor: "ew-resize" }}
                      onMouseDown={e => startDrag(n.col, e)}
                      onTouchStart={e => startDrag(n.col, e)}
                    />
                    {/* Wider invisible grab area */}
                    <rect x={n.x - 6} y={n.y} width={nw + 12} height={n.h} fill="transparent"
                      style={{ cursor: "ew-resize" }}
                      onMouseDown={e => startDrag(n.col, e)}
                      onTouchStart={e => startDrag(n.col, e)}
                    />
                    <text x={lx} y={my - 6} textAnchor={anchor} fill="#d4d4f7" fontSize={fs} fontWeight={600}>{n.label}</text>
                    <text x={lx} y={my + 5} textAnchor={anchor} fill={isDeficit ? "#f87171" : isSurplus ? "#86efac" : "#a78bfa"} fontSize={Math.max(7, fs - 1)}>{fmt(n.value)}</text>
                    <text x={lx} y={my + 15} textAnchor={anchor} fill="#6b6b8a" fontSize={Math.max(6, fs - 2)}>{pct(n.value, grand)}</text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Tooltip */}
          <div style={{
            background: "#16152a", borderRadius: 10, height: 46,
            padding: "8px 14px", border: "1px solid #2d2b4e", fontSize: 14, color: "#d4d4f7",
            display: "flex", alignItems: "center",
          }}>
            {hovLink ? (
              <span>
                <span style={{ color: "#6b6b8a", textTransform: "uppercase", fontSize: 11, letterSpacing: "0.1em" }}>Flow · </span>
                <strong style={{ color: "#c4b5fd" }}>{hovLink.sourceNode.label} → {hovLink.targetNode.label}</strong>
                <span style={{ color: "#6b6b8a" }}> · ${hovLink.value.toLocaleString()} ({pct(hovLink.value, grand)})</span>
              </span>
            ) : (
              <span style={{ color: "#3d3d5c" }}>Hover over an Item to see details</span>
            )}
          </div>
        </div>

        {/* Editor columns below sankey */}
        <div style={{ display: "flex", gap: 14, marginTop: 16, alignItems: "flex-start", flexWrap: "wrap" }}>

          {/* Income column */}
          <div style={{ ...colStyle, flex: 1, minWidth: 240 }}>
            {colHead("Income", grand, "#c4b5fd")}
            {subHead("Active")}
            {income.filter(i => i.type === "active").map(item => (
              <ItemRow key={item.id} item={item} accent="#818cf8"
                onLabel={v => updInLabel(item.id, v)} onValue={v => updInValue(item.id, v)} onRemove={() => remIn(item.id)} />
            ))}
            {subHead("Passive")}
            {income.filter(i => i.type === "passive").map(item => (
              <ItemRow key={item.id} item={item} accent="#a78bfa"
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

          {/* Expense column */}
          <div style={{ ...colStyle, flex: 1, minWidth: 240 }}>
            {colHead("Expenses", totalExp, "#fbcfe8")}
            {CATS.map(cat => {
              const items = expenses.filter(e => e.category === cat);
              return (
                <div key={cat}>
                  {subHead(cat)}
                  {items.map(item => (
                    <ItemRow key={item.id} item={item} accent={CAT_COLORS[cat]}
                      onLabel={v => updExLabel(item.id, v)} onValue={v => updExValue(item.id, v)} onRemove={() => remEx(item.id)} />
                  ))}
                </div>
              );
            })}
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
