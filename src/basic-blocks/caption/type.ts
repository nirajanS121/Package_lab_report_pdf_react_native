import { BaseBlockProps } from "../../content-blocks/type";

export interface CaptionBlockProps extends BaseBlockProps {
  type: "caption";
  fontSize: number;
  isBold: boolean;
  isItalics: boolean;
  isCapsLocks: boolean;
  label: string;
  value: string;
  hideKey?: any;
  hideValue?: any;
}
