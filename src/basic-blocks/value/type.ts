import { BorderProps } from "components/template-editor/properties-panel/functionwise-options/border-options";
import { BaseBlockProps, ITextAlignment } from "../../content-blocks/type";

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
}
