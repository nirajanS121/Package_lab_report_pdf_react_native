import { BaseBlockProps } from "../../content-blocks/type";

export interface LineBlockInternalProps extends BaseBlockProps {
  key: string;
  type: "line";
  label: string;
  width: number;
  height: number;
  color?: string;
  borderStyle?: "solid" | "dashed" | "dotted";
  orientation?: "horizontal" | "vertical";
  lineWidth?: number;
}
