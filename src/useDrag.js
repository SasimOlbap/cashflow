import { useState, useEffect, useRef } from "react";

export function useDrag(svgRef, svgW) {
  const [colOffsets, setColOffsets] = useState([0, 0, 0, 0, 0]);
  const dragRef = useRef(null);

  const startDrag = (col, e) => {
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    dragRef.current = { col, startX: clientX, startOffset: colOffsets[col] };
  };

  useEffect(() => {
    const onMove = e => {
      if (!dragRef.current) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const dx      = clientX - dragRef.current.startX;
      const svgEl   = svgRef.current ? svgRef.current.querySelector("svg") : null;
      const scale   = svgEl ? svgW / svgEl.getBoundingClientRect().width : 1;
      const raw     = dragRef.current.startOffset + dx * scale;
      const col     = dragRef.current.col;
      // Outer columns get a tighter limit, inner columns more freedom
      const limit   = (col === 0 || col === 4) ? svgW * 0.05 : svgW * 0.15;
      const clamped = Math.max(-limit, Math.min(limit, raw));
      setColOffsets(prev => {
        const next = [...prev];
        next[dragRef.current.col] = clamped;
        return next;
      });
    };
    const onUp = () => { dragRef.current = null; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onUp);
    window.addEventListener("touchmove", onMove);
    window.addEventListener("touchend",  onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup",   onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend",  onUp);
    };
  }, [svgRef, svgW]);

  return { colOffsets, startDrag };
}
