import React from "react";

interface WatermarkOverlayProps {
  show?: boolean;
  text?: string;
  columns?: number; 
  rows?: number;
  fontSize?: number;
  opacity?: number;
  rotation?: number;
  gapX?: number;
  gapY?: number;
}

const WatermarkOverlay: React.FC<WatermarkOverlayProps> = ({
  show = false,
  text = "ONLY PREVIEW",
  fontSize = 24,
  opacity = 0.2,
  rotation = -30,
  gapX = 300,
  gapY = 100,
}) => {
  if (!show) return null;

  const svg = `
    <svg xmlns='http://www.w3.org/2000/svg' width='${gapX}' height='${gapY}' viewBox='0 0 ${gapX} ${gapY}'>
      <text x='50%' y='50%' text-anchor='middle' dy='0.35em'
        font-size='${fontSize}' font-family='Arial' fill='rgba(0,0,0,${opacity})'
        transform='rotate(${rotation}, ${gapX / 2}, ${gapY / 2})'>
        ${text}
      </text>
    </svg>`;

  const backgroundImage = `url("data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}")`;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        backgroundImage,
        backgroundSize: `${gapX}px ${gapY}px`,
        zIndex: 9999,
      }}
    />
  );
};

export default WatermarkOverlay;
