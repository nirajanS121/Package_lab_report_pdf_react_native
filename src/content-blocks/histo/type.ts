import { BaseBlockProps } from "../type";

export interface HistoContentBlockProps extends BaseBlockProps {
  type: "description";
  label: string;
  title: string | null;
  subtitle: string | null;
  data?: Array<{ title: string; description: string }>;
}
