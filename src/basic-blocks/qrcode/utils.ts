import { BlockProps, IBlockLocation } from "../../content-blocks/type";
import { QrcodeBlockProps } from "./type";

interface Props {
  key: string;
  label: string;
  mappingKey: string;
  value: string;
  location: IBlockLocation;
}
export const createQrcodeBlock = (props: Props): QrcodeBlockProps => {
  return {
    type: "qrcode",
    isVisible: false,
    fontSize: 12,
    x: 0,
    y: 0,
    ...props,
  };
};

export function isQrcodeBlock(block: BlockProps): block is QrcodeBlockProps {
  return block.type === "qrcode";
}
