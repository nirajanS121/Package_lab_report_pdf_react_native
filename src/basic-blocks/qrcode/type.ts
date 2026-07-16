import { BaseBlockProps } from "../../content-blocks/type";

export interface QrcodeBlockProps extends BaseBlockProps {
  type: "qrcode";
  fontSize: number;
  label: string;
  value: string;
  mappingKey: string;
}
