import React from "react";
import { BarcodeBlock } from "./basic-blocks/barcode";
import { isBarcodeBlock, isHorizontalLineBorder } from "./basic-blocks/barcode/utils";
import { isCaptionBlock } from "./basic-blocks/caption/utils";
import { ImageBlock } from "./basic-blocks/image";
import { isImageBlock } from "./basic-blocks/image/utils";
import { QrcodeBlock } from "./basic-blocks/qrcode";
import { isQrcodeBlock } from "./basic-blocks/qrcode/utils";
import { SignatureBlock } from "./basic-blocks/signature";
import { isSignatureBlock } from "./basic-blocks/signature/utils";
import { isValueBlock } from "./basic-blocks/value/utils";
import { HistoContentBlock } from "./content-blocks/histo";
import { isHistoContentBlock } from "./content-blocks/histo/utils";
import { PathoContentBlock } from "./content-blocks/patho";
import { isPathoContentBlock } from "./content-blocks/patho/utils";

import { ExeValueBlock } from "./basic-blocks/value/ExeIndex";
import { ExeCaptionBlock } from "./basic-blocks/caption/ExeIndex";

interface ExeBlockRenderProps {
  block: any;
  maxWidth: number;
  scaleFactor?: number;
  logoImage?: any;
}

const ExeBlockRender: React.FC<ExeBlockRenderProps> = (props) => {
  const { block, maxWidth, scaleFactor = 1, logoImage } = props;
  return (
    <>
      {isBarcodeBlock(block) ? (
        <BarcodeBlock blockProps={block} scaleFactor={scaleFactor} />
      ) : isHorizontalLineBorder(block) ? (
        <div
          style={{
            //@ts-ignore
            width: block.width,
            borderBottom: '2px solid black',
          }}
        />
      ) : isQrcodeBlock(block) ? (
        <QrcodeBlock blockProps={block} scaleFactor={scaleFactor} />
      ) : isValueBlock(block) ? (
        <ExeValueBlock blockProps={block} scaleFactor={scaleFactor} />
      ) : isCaptionBlock(block) ? (
        <ExeCaptionBlock blockProps={block} scaleFactor={scaleFactor} maxWidth={maxWidth} />
      ) : isSignatureBlock(block) ? (
        <SignatureBlock blockProps={block} scaleFactor={scaleFactor} />
      ) : isImageBlock(block) ? (
        <ImageBlock logoImage={logoImage} blockProps={block} scaleFactor={scaleFactor} />
      ) : isPathoContentBlock(block) ? (
        <PathoContentBlock blockProps={block} scaleFactor={scaleFactor} maxWidth={maxWidth} />
      ) : isHistoContentBlock(block) ? (
        <HistoContentBlock blockProps={block} scaleFactor={scaleFactor} maxWidth={maxWidth} />
      ) : (
        <>Block Not Implemented</>
      )}

    </>
  );
};

export default ExeBlockRender;
