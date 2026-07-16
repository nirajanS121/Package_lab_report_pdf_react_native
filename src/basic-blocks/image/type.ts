import { BaseBlockProps } from "../../content-blocks/type";

export interface ImageBlockProps extends BaseBlockProps {
  type: "image";
  height: number;
  width: number;
  label: string;
  mappingKey: string;
  url?: string;
}
