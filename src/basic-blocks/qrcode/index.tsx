import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { QrcodeBlockProps } from "./type";

interface Props {
  blockProps: QrcodeBlockProps;
  scaleFactor?: number;
}

export const QrcodeBlock: React.FC<Props> = ({ blockProps, scaleFactor = 1 }) => {
  const { value, fontSize } = blockProps;

  if (!value) return null;

  const size = fontSize * scaleFactor;
  return (
    <QRCodeSVG
      value={value}
      height={size}
      width={size}
      bgColor="transparent"
    />
  );
};
