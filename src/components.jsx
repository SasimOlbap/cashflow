// ── subcomponents ──────────────────────────────────────────────────────────

// ── LinkPath ──────────────────────────────────────────────────────────────
export function LinkPath({ link, color, onHover, hovered }) {
  const { sx, tx, sy0, sy1, ty0, ty1 } = link;
  const mx  = (sx + tx) / 2;
  const key = link.source + "-" + link.target;
  const d   = `M${sx},${sy0} C${mx},${sy0} ${mx},${ty0} ${tx},${ty0} L${tx},${ty1} C${mx},${ty1} ${mx},${sy1} ${sx},${sy1} Z`;
  return (
    <path d={d} fill={color} opacity={hovered === key ? 0.85 : 0.4}
      style={{ transition: "opacity 0.15s", cursor: "pointer" }}
      onMouseEnter={() => onHover(key)} onMouseLeave={() => onHover(null)} />
  );
}

// ── ItemRow ───────────────────────────────────────────────────────────────
export function ItemRow({ item, accent, onLabel, onValue, onRemove, T }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
      <div style={{ width: 3, height: 34, borderRadius: 2, background: accent, flexShrink: 0 }} />
      <input value={item.label} onChange={e => onLabel(e.target.value)}
        style={{ flex: 1, minWidth: 0, background: T.bgInput, border: `1px solid ${T.borderInput}`,
          borderRadius: 6, color: T.textNode, fontSize: 15, padding: "4px 7px", outline: "none" }} />
      <div style={{ position: "relative", flexShrink: 0 }}>
        <span style={{ position: "absolute", left: 7, top: "50%", transform: "translateY(-50%)",
          color: T.textDim, fontSize: 15, pointerEvents: "none" }}>$</span>
        <input type="number" min="0" value={item.value} onChange={e => onValue(e.target.value)}
          onFocus={e => e.target.select()}
          style={{ width: 86, background: T.bgInput, border: `1px solid ${T.borderInput}`,
            borderRadius: 6, color: T.textVal, fontSize: 15, padding: "4px 6px 4px 18px", outline: "none" }} />
      </div>
      <button onClick={onRemove}
        style={{ background: "none", border: "none", color: T.textFaint, cursor: "pointer", fontSize: 19, padding: "0 2px", lineHeight: 1 }}
        onMouseEnter={e => (e.currentTarget.style.color = "#ff6b6b")}
        onMouseLeave={e => (e.currentTarget.style.color = T.textFaint)}>×</button>
    </div>
  );
}

// ── SankeyNode ────────────────────────────────────────────────────────────
export function SankeyNode({ n, nodeWidth, T, GROUP_COLORS, grand, fmt, pct, startDrag }) {
  const isSurplus = n.id === "__surplus" || n.id === "__surplus_leaf";
  const isDeficit = n.id === "__deficit_src" || n.id === "__deficit_agg";
  const c   = isDeficit ? GROUP_COLORS.deficit : isSurplus ? GROUP_COLORS.surplus : GROUP_COLORS[n.group];
  const nw  = n.w || nodeWidth;
  const right  = n.col >= 3;
  const lx     = right ? n.x + nw + 6 : n.x - 6;
  const anchor = right ? "start" : "end";
  const my = n.y + n.h / 2;
  const fs = Math.min(11, Math.max(7, n.h * 0.26));
  return (
    <g key={n.id}>
      <rect x={n.x} y={n.y} width={nw} height={n.h} fill={c} rx={3}
        style={{ filter: `drop-shadow(0 0 3px ${c}88)`, cursor: "ew-resize" }}
        onMouseDown={e => startDrag(n.col, e)} onTouchStart={e => startDrag(n.col, e)} />
      <rect x={n.x - 6} y={n.y} width={nw + 12} height={n.h} fill="transparent"
        style={{ cursor: "ew-resize" }}
        onMouseDown={e => startDrag(n.col, e)} onTouchStart={e => startDrag(n.col, e)} />
      <text x={lx} y={my - 6} textAnchor={anchor} fill={T.textNode} fontSize={fs} fontWeight={600}>{n.label}</text>
      <text x={lx} y={my + 5}  textAnchor={anchor} fill={isDeficit ? "#f87171" : isSurplus ? "#86efac" : T.textVal} fontSize={Math.max(7, fs - 1)}>{fmt(n.value)}</text>
      <text x={lx} y={my + 15} textAnchor={anchor} fill={T.textDim} fontSize={Math.max(6, fs - 2)}>{pct(n.value, grand)}</text>
    </g>
  );
}
