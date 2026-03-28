export function Flowchart() {
  const boxes = [
    { x: 360, y: 24, w: 260, h: 64, text: 'Start: training context' },
    { x: 360, y: 120, w: 260, h: 64, text: 'Time available? 5 / 10 / 15 / 20' },
    { x: 80, y: 230, w: 250, h: 84, text: 'Pain / threat?\nnone / mild / moderate' },
    { x: 365, y: 230, w: 250, h: 84, text: 'Goal + training type?\npowerlifting / fat loss / endurance / sport' },
    { x: 650, y: 230, w: 250, h: 84, text: 'Restrictions?\nankle / hip / T-spine / shoulder / trunk' },
    { x: 80, y: 380, w: 160, h: 62, text: 'Prepare' },
    { x: 260, y: 380, w: 160, h: 62, text: 'Position' },
    { x: 440, y: 380, w: 160, h: 62, text: 'Access' },
    { x: 620, y: 380, w: 160, h: 62, text: 'Integrate' },
    { x: 800, y: 380, w: 120, h: 62, text: 'Express' },
    {
      x: 330,
      y: 520,
      w: 320,
      h: 86,
      text: 'Check first rep quality\nIf poor: regress, repeat integrate, or trim range'
    },
    { x: 330, y: 654, w: 320, h: 70, text: 'Output: warm-up + decision log + rationale' }
  ];

  const lines = [
    [490, 88, 490, 120],
    [490, 184, 205, 230],
    [490, 184, 490, 230],
    [490, 184, 775, 230],
    [205, 314, 160, 380],
    [490, 314, 340, 380],
    [775, 314, 520, 380],
    [160, 442, 260, 442],
    [420, 442, 440, 442],
    [600, 442, 620, 442],
    [780, 442, 800, 442],
    [860, 442, 650, 563],
    [490, 606, 490, 654]
  ];

  return (
    <div className="flowchart">
      <svg viewBox="0 0 980 760" role="img" aria-label="Coach decision tree for warm-up generation">
        <defs>
          <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="#7dd3fc" />
          </marker>
        </defs>

        {boxes.map((box, i) => (
          <g key={i}>
            <rect
              x={box.x}
              y={box.y}
              rx="18"
              ry="18"
              width={box.w}
              height={box.h}
              fill="#18213f"
              stroke="#2c3a66"
            />
            {box.text.split('\n').map((line, index) => (
              <text
                key={index}
                x={box.x + box.w / 2}
                y={box.y + 28 + index * 22}
                textAnchor="middle"
                fill="#ecf1ff"
                fontSize="18"
                fontFamily="Inter, sans-serif"
              >
                {line}
              </text>
            ))}
          </g>
        ))}

        {lines.map(([x1, y1, x2, y2], i) => (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#7dd3fc"
            strokeWidth="3"
            markerEnd="url(#arrow)"
          />
        ))}
      </svg>
    </div>
  );
}
