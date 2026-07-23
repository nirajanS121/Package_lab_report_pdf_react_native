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

  if (!(valueUpdate?.length > 0)) return "";

  // react-barcode (JsBarcode under the hood) draws itself imperatively onto
  // a real DOM node via a ref, after mount — there's no real DOM in the
  // React Native static-render path (react-test-renderer runs effects but
  // has no host environment to hand back), so calling it there throws
  // "InvalidElementException: Not supported type to render on" instead of
  // just rendering blank. Skip it there; render normally in web/Electron.
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
      // width={fontSize * 0.075 * scaleFactor}
      fontSize={fontSize * scaleFactor}
      marginBottom={5}
      background="transparent"
    />
  );
};
