import { BlockProps } from "../type";
import { ITableDataRow, ITableHeadingRow, ITableProfile, ITableRow, PathoContentBlockProps } from "./type";

interface Props {
  key: string;
  label: string;
  title: string;
  data: Array<ITableProfile>;
}

export const createPathoContentBlock = (props: Props): PathoContentBlockProps => {
  const PathoContentBlock: PathoContentBlockProps = {
    type: "table",
    location: "content",
    isVisible: false,
    x: 0,
    y: 0,
    ...props,
  };

  return PathoContentBlock;
};

export function isPathoContentBlock(block: BlockProps): block is PathoContentBlockProps {
  return block.type === "table";
}

export function isHeadingRow(row: ITableRow): row is ITableHeadingRow {
  return row.type === "heading";
}

export function isDataRow(block: ITableRow): block is ITableDataRow {
  return block.type === "data";
}
