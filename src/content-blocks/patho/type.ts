import { BaseBlockProps } from "../type";

export interface TableHeaderBlockProps {
  value: string;
  isBold: boolean;
  isItalics: boolean;
  fontSize: number;
}

export interface ITableDataRow {
  type: "data";
  test: string;
  method: string | null;
  specimen_name: string | null;
  result: string;
  showFlag: boolean;
  hideUnitRef: boolean;
  flag: string | null;
  unit: string | null;
  referenceRange: string | null;
  endnote?: string;
  result_type: string;
  freetext_range: string | null;
  comment?: string;
  display_nameEndnote?: string | null;
  abnormal?: boolean;
  level: number;

  antibiotic_results: Array<{ antibiotic_level: "S" | "R" | "I"; name: string }>;
  finding_posted_user_name?:any;
  verified_user_name?:any
}
export interface ITableHeadingRow {
  type: "heading" | "department_heading";
  title: string;
  level: number;
  hideUnitRef: boolean;
}

export type ITableRow = ITableDataRow | ITableHeadingRow;
export interface ITableProfile {
  title?: string;
  data: Array<ITableRow>;
  remarks: string | null;
  department_name?: string | null;
}

export interface PathoContentBlockProps extends BaseBlockProps {
  type: "table";
  label: string;
  title: string;
  data?: Array<ITableProfile>;
}
