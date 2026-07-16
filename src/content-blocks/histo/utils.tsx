import { BlockProps } from "../type";
import { HistoContentBlockProps } from "./type";

interface Props {
  key: string;
  label: string;
  title: string;
  subtitle: string;
  data: Array<{ title: string; description: string }>;
}

export const createHistoContentBlock = (props: Props): HistoContentBlockProps => {
  const description: HistoContentBlockProps = {
    type: "description",
    isVisible: false,
    x: 0,
    y: 0,
    location: "content",
    ...props,
  };

  return description;
};

export function isHistoContentBlock(block: BlockProps): block is HistoContentBlockProps {
  return block.type === "description";
}
