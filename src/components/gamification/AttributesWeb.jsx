import React from 'react';

const PILLARS = [
  "Surrender",
  "Imagination",
  "Identity",
  "Health",
  "Work",
  "Generosity",
  "Sabbath"
];

const MAX_XP = 1000;
const RADIUS = 100;
const CENTER_X = 150;
const CENTER_Y = 150;

function getPoint(angle, radius) {
  const rad = (angle - 90) * (Math.PI / 180);
  return {
    x: CENTER_X + radius * Math.cos(rad),
    y: CENTER_Y + radius * Math.sin(rad)
  };
}

export default function AttributesWeb({ perPillar = {} }) {
  const angleStep = 360 / PILLARS.length;

  const rings = [0.25, 0.5, 0.75, 1].map(scale => {
    const points = PILLARS.map((_, i) => {
      const pt = getPoint(i * angleStep, RADIUS * scale);
      return `${pt.x},${pt.y}`;
    }).join(' ');
    return <polygon key={scale} points={points} stroke="rgba(200,169,81,0.12)" strokeWidth="1" fill="none" />;
  });

  const axes = [];
  const labels = [];
  const dataPoints = [];

  PILLARS.forEach((pillar, i) => {
    const angle = i * angleStep;
    const outerPt = getPoint(angle, RADIUS);
    
    axes.push(
      <line 
        key={`axis-${i}`} 
        x1={CENTER_X} 
        y1={CENTER_Y} 
        x2={outerPt.x} 
        y2={outerPt.y} 
        stroke="rgba(200,169,81,0.15)" 
        strokeWidth="1" 
      />
    );

    const labelPt = getPoint(angle, RADIUS + 18);
    labels.push(
      <text 
        key={`label-${i}`} 
        x={labelPt.x} 
        y={labelPt.y} 
        fontSize="9" 
        fill="#8A8678" 
        fontFamily="DM Sans" 
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {pillar}
      </text>
    );

    const xp = Math.min(perPillar[pillar] || 0, MAX_XP);
    const dataRadius = (xp / MAX_XP) * RADIUS;
    const dataPt = getPoint(angle, dataRadius);
    dataPoints.push(`${dataPt.x},${dataPt.y}`);
  });

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <style>
        {`
          @keyframes webFadeIn {
            0% { opacity: 0; }
            100% { opacity: 1; }
          }
        `}
      </style>
      <div style={{ fontSize: "10px", color: "#C8A951", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "1rem" }}>
        ATTRIBUTES
      </div>
      <svg viewBox="0 0 300 300" style={{ width: "100%", maxWidth: "300px" }}>
        {rings}
        {axes}
        <polygon 
          points={dataPoints.join(' ')} 
          fill="rgba(200,169,81,0.2)" 
          stroke="#C8A951" 
          strokeWidth="2" 
          style={{ animation: "webFadeIn 0.8s ease-out forwards" }}
        />
        {labels}
      </svg>
    </div>
  );
}
