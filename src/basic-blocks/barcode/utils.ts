import { BlockProps, IBlockLocation } from "../../content-blocks/type";
import { BarcodeBlockProps } from "./type";

interface Props {
  key: string;
  label: string;
  mappingKey: string;
  value: string;
  location: IBlockLocation;
}

export const createBarcodeBlock = (props: Props): BarcodeBlockProps => {
  return {
    type: "barcode",
    isVisible: false,
    fontSize: 12,
    x: 0,
    y: 0,
    ...props,
  };
};

export function isBarcodeBlock(block: BlockProps): block is BarcodeBlockProps {
  return block.type === "barcode";
}

export function isHorizontalLineBorder(block: BlockProps): boolean {
  return block.type === "value" && block.mappingKey === "horizontal_line_border";
}

