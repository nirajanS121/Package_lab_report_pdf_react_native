import { CaptionBlockProps } from "./type";

interface Props {
  blockProps: CaptionBlockProps | any;
  scaleFactor?: number;
  maxWidth: number;
}

export const ExeCaptionBlock: React.FC<Props> = (props) => {
  const { blockProps, maxWidth, scaleFactor = 1 } = props;
  const { value, isBold, isItalics, fontSize, isCapsLocks, hideKey, hideValue, ...rest } = blockProps;
  // Enables spaces and newline in the value
  // eslint-disable-next-line no-regex-spaces
  const formattedValue = value?.replace(/\n/g, "<br />").replace(/  /g, "&nbsp;&nbsp;");
  // console.log(formattedValue,"formattedValueformattedValueformattedValue")

  if (hideKey && hideValue && rest[hideKey] === hideValue) {
    // Don't render the block if HideKey and hideValue match
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
        //fore direct print i make
        height:"30px"
      }}
    >
      {/* Render HTML content with line breaks and spaces */}
      <div dangerouslySetInnerHTML={{ __html: formattedValue }}></div>
    </div>
  );
};
