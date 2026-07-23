import { CaptionBlockProps } from "./type";

interface Props {
  blockProps: CaptionBlockProps | any;
  scaleFactor?: number;
  maxWidth: number;
}

export const CaptionBlock: React.FC<Props> = (props) => {
  const { blockProps, maxWidth, scaleFactor = 1 } = props;
  const {
    value,
    isBold,
    isItalics,
    fontSize,
    isCapsLocks,
    hideKey,
    hideValue,
    ...rest
  } = blockProps;
  const formattedValue = value
    ?.replace(/\n/g, "<br />")
    .replace(/  /g, "&nbsp;&nbsp;");

  if (hideKey && hideValue && rest[hideKey] === hideValue) {
    return null;
  }
  return (
    <div
      style={{
        maxWidth: maxWidth * scaleFactor,
        fontSize: `${fontSize * scaleFactor}px`,
        fontWeight: isBold ? "600" : "normal",
        fontStyle: isItalics ? "italic" : "normal",
        textTransform: isCapsLocks ? "uppercase" : "none",
        wordWrap: "break-word",
        whiteSpace: "normal",
        overflowWrap: "anywhere",
        textAlign: "start",
      }}
    >
      <div dangerouslySetInnerHTML={{ __html: formattedValue }}></div>
    </div>
  );
};
