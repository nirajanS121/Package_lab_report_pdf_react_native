import { ValueBlockProps } from "./type";

interface Props {
  blockProps: ValueBlockProps | any;
  scaleFactor?: number;
}

export const ExeValueBlock: React.FC<Props> = ({
  blockProps,
  scaleFactor = 1,
}) => {
  const {
    value,
    isBold,
    width,
    isItalics,
    fontSize,
    alignment,
    border,
    isCapsLocks,
    hideKey,
    hideValue,
    ...rest
  } = blockProps;

  if (hideKey && hideValue && rest[hideKey] === hideValue) {
    return null;
  }
  return (
    <div
      style={{
        fontSize: `${fontSize * scaleFactor}px`,
        fontWeight: isBold ? "600" : "normal",
        fontStyle: isItalics ? "italic" : "normal",
        textAlign: alignment,
        width: `${width * scaleFactor}px`,
        textTransform: isCapsLocks ? "uppercase" : "none",
        overflow: "clip",
        borderLeft: border?.left
          ? `${border.width * scaleFactor}px ${border.style}`
          : "none",
        borderRight: border?.right
          ? `${border.width * scaleFactor}px ${border.style}`
          : "none",
        borderTop: border?.top
          ? `${border.width * scaleFactor}px ${border.style}`
          : "none",
        borderBottom: border?.bottom
          ? `${border.width * scaleFactor}px ${border.style}`
          : "none",
        height: "30px",
      }}
    >
      {value ?? <div className="text-white"></div>}
    </div>
  );
};
