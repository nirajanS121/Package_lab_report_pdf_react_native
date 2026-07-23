import { BarcodeBlockProps } from "../basic-blocks/barcode/type";
import { CaptionBlockProps } from "../basic-blocks/caption/type";
import { ImageBlockProps } from "../basic-blocks/image/type";
import { QrcodeBlockProps } from "../basic-blocks/qrcode/type";
import { SignatureBlockProps } from "../basic-blocks/signature/type";
import { ValueBlockProps } from "../basic-blocks/value/type";
import { HistoContentBlockProps } from "./histo/type";
import { PathoContentBlockProps } from "./patho/type";
import { LineBlockInternalProps } from "../basic-blocks/Line/type";

export type BlockProps =
  | CaptionBlockProps
  | ValueBlockProps
  | BarcodeBlockProps
  | QrcodeBlockProps
  | LineBlockInternalProps
  | PathoContentBlockProps
  | SignatureBlockProps
  | ImageBlockProps
  | HistoContentBlockProps;

export type BlockTypeProps =
  | "caption"
  | "value"
  | "barcode"
  | "qrcode"
  | "table"
  | "signature"
  | "bill"
  | "image"
  | "description"
  | "deposit"
  | "refund"
  | "E"
  | "J"
  | "P"
  | "I"
  | "R"
  | "C"
  | "sales"
  | "sales_final_bill"
  | "sales_return"
  | "purchase_requisition"
  | "purchase_order"
  | "direct_receive"
  | "receive_against_order"
  | "purchase_return"
  | "credit_note"
  | "transfer_requisition"
  | "stock_transfer"
  | "service_bill"
  | "direct_purchase"
  | "admission_form"
  | "final_bill"
  | "estimate_bill_detail"
  | "estimate_bill_summary"
  | "service_bill_refund"
  | "credit_payment_receipt"
  | "user_wise_collection"
  | "patient_wise_sales"
  | "prescribe_medicine"
  | "issue"
  | "line"
  | "creditClearance"
  | "bulkCreditClearance";

export type IBlockLocation = "header" | "footer" | "content";
export type ITextAlignment = "left" | "center" | "right";
export interface BaseBlockProps {
  key: string;
  isVisible: boolean;
  isCloned?: boolean;
  x: number;
  y: number;
  location: "header" | "footer" | "content";
}

export type IMappingKey = string | Array<string | number>;
