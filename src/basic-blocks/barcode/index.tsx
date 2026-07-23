import React from "react";
import Barcode from "react-barcode";
import { BarcodeBlockProps } from "./type";

interface Props {
  blockProps: BarcodeBlockProps;
  scaleFactor?: number;
}

export const BarcodeBlock: React.FC<Props> = (props) => {
  const { blockProps, scaleFactor = 1 } = props;
  const { value, fontSize } = blockProps;
  const valueUpdate = `${value}`;

  if (!(valueUpdate?.length > 0)) return null;

  if (typeof document === "undefined") {
    return null;
  }

  return (
    <Barcode
      margin={0}
      textMargin={0}
      displayValue={false}
      value={valueUpdate}
      height={fontSize * 2 * scaleFactor}
      width={1.6}
      fontSize={fontSize * scaleFactor}
      marginBottom={5}
      background="transparent"
    />
  );
};
