import { BlockProps } from "../../content-blocks/type";
import { LineBlockInternalProps } from "./type";

interface Props {
  key: string;
  width: number;
  height: number;
  color?: string;
  label?: string;
  location?: "header" | "footer" | "content";
  orientation?: "horizontal" | "vertical";
}

export const createLineBlock = (props: Props): LineBlockInternalProps => {
  const block: LineBlockInternalProps = {
    type: "line",
    isVisible: false,
    label: "Line",
    x: 0,
    y: 0,
    color: "#000",
    location: "content",
    orientation: "horizontal",
    borderStyle: "solid",
    ...props,
  };
  return block;
};

export function isLineBlock(block: BlockProps) {
  return block?.type === "line";
}
