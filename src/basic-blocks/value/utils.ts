import { BlockProps, IBlockLocation } from "../../content-blocks/type";
import { ValueBlockProps } from "./type";

interface Props {
  key: string;
  label: string;
  mappingKey: string | Array<string>;
  location: IBlockLocation;
  hideKey?: any;
  hideValue?: any;
}

export const createValueBlock = (props: Props): ValueBlockProps => {
  return {
    type: "value",
    value: props.label,
    isVisible: false,
    hideKey: props?.hideKey,
    hideValue: props?.hideValue,
    x: 0,
    y: 0,
    fontSize: 12,
    isBold: false,
    isItalics: false,
    isCapsLocks: false,
    width: props.label.length * 10,
    alignment: "left",
    border: {
      left: false,
      top: false,
      right: false,
      bottom: false,
      width: 1,
      style: "solid",
    },
    ...props,
  };
};

export function isValueBlock(block: BlockProps): block is ValueBlockProps {
  return block.type === "value";
}
export function isBarcodeBlock(block: BlockProps): block is ValueBlockProps {
  return block.type === "barcode";
}
