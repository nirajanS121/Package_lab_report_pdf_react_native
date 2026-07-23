import { BaseBlockProps, ITextAlignment } from "../../content-blocks/type";

export interface BorderProps {
  left: boolean;
  right: boolean;
  top: boolean;
  bottom: boolean;
  width: number;
  style: "solid" | "dashed" | "dotted";
}

export interface ValueBlockProps extends BaseBlockProps {
  type: "value";

  fontSize: number;
  isBold: boolean;
  isItalics: boolean;
  isCapsLocks: boolean;
  label: string;
  value: string;
  width: number;
  alignment: ITextAlignment;
  mappingKey: string | Array<string | number>;
  border: BorderProps;
  hideKey?: any;
  hideValue?: any;
  frontendConditionValue?: string;
  frontendNumberOfRow?: number;
}
