import { BaseBlockProps } from "../../content-blocks/type";

export interface SignatureBlockProps extends BaseBlockProps {
  type: "signature";
  imageUrl?: string;
  maxHeight: number;
  maxWidth: number;
  label: string;
  mappingKey: string;
  specialities?: string;
  caption: string | null;
  name: string | null;
  qualification: string | null;
  specialization: string | null;
  nmc: string | null;
  nhpc_no: string | null;
  designation?: string | any;
  frontendConditionValue?: string;
}
