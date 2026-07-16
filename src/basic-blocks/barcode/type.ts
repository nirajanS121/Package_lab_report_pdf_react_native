import { BaseBlockProps } from "../../content-blocks/type";

export interface BarcodeBlockProps extends BaseBlockProps {
  type: "barcode";
  fontSize: number;
  label: string;
  value: string;
  mappingKey: string;
}
