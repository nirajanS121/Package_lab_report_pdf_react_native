import { BlockProps, IBlockLocation } from "../../content-blocks/type";
import { CaptionBlockProps } from "./type";

interface Props {
  key: string;
  label: string;
  location: IBlockLocation;
  hideKey?: any;
  hideValue?: any;
}

export const createCaptionBlock = (props: Props): CaptionBlockProps => {
  return {
    type: "caption",
    value: props.label,
    isVisible: false,
    x: 0,
    y: 0,
    hideKey: props?.hideKey,
    hideValue: props?.hideValue,
    fontSize: 12,
    isBold: false,
    isItalics: false,
    isCapsLocks: false,
    ...props,
  };
};

export function isCaptionBlock(block: BlockProps): block is CaptionBlockProps {
  return block.type === "caption";
}
