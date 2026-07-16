import React from "react";
import { LineBlockInternalProps } from "./type";

interface LineBlockProps {
  blockProps: LineBlockInternalProps;
  scaleFactor?: number;
}

export const LineBlock: React.FC<LineBlockProps> = ({ blockProps, scaleFactor = 1 }) => {
  const {
    x,
    y,
    width,
    height,
    color = "#000",
    orientation = "horizontal",
    isVisible = true,
    borderStyle = "solid",
  } = blockProps;

  if (!isVisible) return null;

  const isHorizontal = orientation === "horizontal";

  if (borderStyle === "solid") {
    return (
      <div
        style={{
          top: y * scaleFactor,
          left: x * scaleFactor,
          width: isHorizontal ? width * scaleFactor : height * scaleFactor,
          height: isHorizontal ? height * scaleFactor : width * scaleFactor,
          backgroundColor: color,
          transformOrigin: "top left",
          pointerEvents: "none",
        }}
      />
    );
  }

  return (
    <div
      style={{
        top: y * scaleFactor,
        left: x * scaleFactor,
        width: isHorizontal ? width * scaleFactor : 0,
        height: isHorizontal ? 0 : width * scaleFactor,
        borderTop: isHorizontal ? `${height * scaleFactor}px ${borderStyle} ${color}` : "none",
        borderLeft: !isHorizontal ? `${height * scaleFactor}px ${borderStyle} ${color}` : "none",
        transformOrigin: "top left",
        pointerEvents: "none",
        boxSizing: "border-box",
      }}
    />
  );
};
