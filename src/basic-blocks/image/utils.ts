import { BlockProps, IBlockLocation } from "../../content-blocks/type";
import { ImageBlockProps } from "./type";

interface Props {
  key: string;
  mappingKey: string;
  location: IBlockLocation;
  label: string;
  height: number;
  width: number;
}

export const createImageBlock = (props: Props): ImageBlockProps => {
  const block: ImageBlockProps = {
    type: "image",
    isVisible: false,
    x: 0,
    y: 0,
    url: "",
    ...props,
  };

  return block;
};

export function isImageBlock(block: BlockProps): block is ImageBlockProps {
  return block.type === "image";
}

export function isPathoTableBlock(block: BlockProps): block is ImageBlockProps {
  return block.type === "table";
}

export function isDischargeDetail(block: BlockProps): block is ImageBlockProps {
  return block.type === "estimate_bill_detail";
}
