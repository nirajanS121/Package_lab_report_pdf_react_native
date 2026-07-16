export interface WaterMarkProps {
  type: "image" | "color";
  name?: string;
  width?: number;
  height?: number;
}

export interface ImageWaterMarkProps extends WaterMarkProps {
  type: "image";
  name: string;
  width: number;
  height: number;
}

export interface ColorWaterMarkProps extends WaterMarkProps {
  type: "color";
  name: string;
}

export function isImageWatermark(block: WaterMarkProps): block is ImageWaterMarkProps {
  return block.type === "image";
}

export function isColorWatermark(block: WaterMarkProps): block is ColorWaterMarkProps {
  return block.type === "color";
}
