import React from "react";
import { BarcodeBlock } from "./basic-blocks/barcode";
import {
  isBarcodeBlock,
  isHorizontalLineBorder,
} from "./basic-blocks/barcode/utils";
import { CaptionBlock } from "./basic-blocks/caption";
import { isCaptionBlock } from "./basic-blocks/caption/utils";
import { ImageBlock } from "./basic-blocks/image";
import { isImageBlock } from "./basic-blocks/image/utils";
import { LineBlock } from "./basic-blocks/Line";
import { isLineBlock } from "./basic-blocks/Line/utils";
import { QrcodeBlock } from "./basic-blocks/qrcode";
import { isQrcodeBlock } from "./basic-blocks/qrcode/utils";
import { SignatureBlock } from "./basic-blocks/signature";
import { isSignatureBlock } from "./basic-blocks/signature/utils";
import { ValueBlock } from "./basic-blocks/value";
import { isValueBlock } from "./basic-blocks/value/utils";
import { HistoContentBlock } from "./content-blocks/histo";
import { isHistoContentBlock } from "./content-blocks/histo/utils";
import { PathoContentBlock } from "./content-blocks/patho";
import { isPathoContentBlock } from "./content-blocks/patho/utils";

interface BlockRenderProps {
  block: any;
  maxWidth: number;
  scaleFactor?: number;
  logoImage?: any;
}

const BlockRender: React.FC<BlockRenderProps> = (props) => {
  const { block, maxWidth, scaleFactor = 1, logoImage } = props;
  return (
    <>
      {isBarcodeBlock(block) ? (
        <BarcodeBlock blockProps={block} scaleFactor={scaleFactor} />
      ) : isHorizontalLineBorder(block) ? (
        <div
          style={{
            width: block.width,
            borderBottom: "2px solid black",
          }}
        />
      ) : isQrcodeBlock(block) ? (
        <QrcodeBlock blockProps={block} scaleFactor={scaleFactor} />
      ) : isValueBlock(block) ? (
        <ValueBlock blockProps={block} scaleFactor={scaleFactor} />
      ) : isCaptionBlock(block) ? (
        <CaptionBlock
          blockProps={block}
          scaleFactor={scaleFactor}
          maxWidth={maxWidth}
        />
      ) : isSignatureBlock(block) ? (
        <SignatureBlock blockProps={block} scaleFactor={scaleFactor} />
      ) : isLineBlock(block) ? (
        <LineBlock blockProps={block} scaleFactor={scaleFactor} />
      ) : isImageBlock(block) ? (
        <ImageBlock
          logoImage={logoImage}
          blockProps={block}
          scaleFactor={scaleFactor}
        />
      ) : isPathoContentBlock(block) ? (
        <PathoContentBlock
          blockProps={block}
          scaleFactor={scaleFactor}
          maxWidth={maxWidth}
        />
      ) : isHistoContentBlock(block) ? (
        <HistoContentBlock
          blockProps={block}
          scaleFactor={scaleFactor}
          maxWidth={maxWidth}
        />
      ) : (
        <>Block Not Implemented</>
      )}
    </>
  );
};

export default BlockRender;
