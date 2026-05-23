const fmt = (v) => Math.round(v);

const CropOverlay = ({ cropBox, scale, isAvatar = false, onResizeStart }) => {
  if (!cropBox || cropBox.w < 4 || cropBox.h < 4) return null;
  const { x, y, w, h } = cropBox;
  const cx = x + w / 2, cy = y + h / 2, r = Math.min(w, h) / 2;

  const corners = [
    { anchor: 'nw', cx: x, cy: y, cursor: 'nw-resize' },
    { anchor: 'ne', cx: x + w, cy: y, cursor: 'ne-resize' },
    { anchor: 'sw', cx: x, cy: y + h, cursor: 'sw-resize' },
    { anchor: 'se', cx: x + w, cy: y + h, cursor: 'se-resize' },
  ];

  const edges = [
    { anchor: 'n', cx: x + w / 2, cy: y, cursor: 'n-resize', horiz: true },
    { anchor: 's', cx: x + w / 2, cy: y + h, cursor: 's-resize', horiz: true },
    { anchor: 'w', cx: x, cy: y + h / 2, cursor: 'w-resize', horiz: false },
    { anchor: 'e', cx: x + w, cy: y + h / 2, cursor: 'e-resize', horiz: false },
  ];

  const startResize = (e, anchor) => {
    e.stopPropagation(); 
    onResizeStart?.(anchor);
  };

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'inherit' }}>
        <defs>
          <mask id="crop-mask">
            <rect width="100%" height="100%" fill="white" />
            <rect x={x} y={y} width={w} height={h} fill="black" />
          </mask>
        </defs>

        <rect width="100%" height="100%" fill="rgba(0,0,0,0.55)" mask="url(#crop-mask)" />

        <rect x={x} y={y} width={w} height={h}
          fill="none" stroke="rgba(0,0,0,0.55)" strokeWidth="1.5" />
        <rect x={x} y={y} width={w} height={h}
          fill="none" stroke="rgba(255,255,255,0.95)" strokeWidth="1" />

        {isAvatar && (
          <>
            <defs>
              <mask id="circle-mask">
                <rect x={x} y={y} width={w} height={h} fill="white" />
                <circle cx={cx} cy={cy} r={r} fill="black" />
              </mask>
            </defs>
            <rect x={x} y={y} width={w} height={h}
              fill="rgba(0,0,0,0.45)" mask="url(#circle-mask)" />
            <circle cx={cx} cy={cy} r={r}
              fill="none" stroke="rgba(255,255,255,0.7)"
              strokeWidth="1.5" strokeDasharray="6 3" />
          </>
        )}

        {[1 / 3, 2 / 3].map((t, i) => (
          <g key={i}>
            <line x1={x + w * t} y1={y} x2={x + w * t} y2={y + h}
              stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
            <line x1={x} y1={y + h * t} x2={x + w} y2={y + h * t}
              stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
          </g>
        ))}

        {w > 80 && h > 36 && (
          <text x={x + w / 2} y={y + h / 2}
            textAnchor="middle" dominantBaseline="middle"
            fill="rgba(255,255,255,0.65)" fontSize="11"
            fontFamily="Space Mono, monospace">
            {fmt(w / scale)} × {fmt(h / scale)}
          </text>
        )}

        {edges.map(({ anchor, cx, cy, cursor, horiz }) => {
          const pw = horiz ? 28 : 6;
          const ph = horiz ? 6 : 28;
          return (
            <g key={anchor} style={{ pointerEvents: 'all', cursor }}
              onMouseDown={(e) => startResize(e, anchor)}>
              <rect x={cx - pw / 2 - 4} y={cy - ph / 2 - 4}
                width={pw + 8} height={ph + 8} fill="transparent" />
              <rect x={cx - pw / 2} y={cy - ph / 2}
                width={pw} height={ph} rx={3}
                fill="white" opacity="0.9"
                stroke="var(--accent)" strokeWidth="1.5" />
              {horiz ? (
                <>
                  <line x1={cx - 5} y1={cy} x2={cx + 5} y2={cy}
                    stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" />
                </>
              ) : (
                <>
                  <line x1={cx} y1={cy - 5} x2={cx} y2={cy + 5}
                    stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" />
                </>
              )}
            </g>
          );
        })}

        {corners.map(({ anchor, cx, cy, cursor }) => (
          <g key={anchor} style={{ pointerEvents: 'all', cursor }}
            onMouseDown={(e) => startResize(e, anchor)}>
            <rect x={cx - 10} y={cy - 10} width={20} height={20} fill="transparent" />
            <rect x={cx - 6} y={cy - 6} width={12} height={12} rx={2}
              fill="white" stroke="#7c6af7" strokeWidth="2" />
          </g>
        ))}
      </svg>
    </div>
  );
};

export default CropOverlay;
