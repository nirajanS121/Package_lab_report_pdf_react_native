import React, { useRef } from "react";
import { ValueBlockProps } from "./type";

interface Props {
  blockProps: ValueBlockProps | any;
  scaleFactor?: number;
}

export const ValueBlock: React.FC<Props> = ({ blockProps, scaleFactor = 1 }) => {
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
    frontendConditionValue,
    frontendNumberOfRow,
    ...rest
  } = blockProps;
  if (hideKey && hideValue && rest[hideKey] === hideValue) return null;

  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const isAutoResize = frontendConditionValue === "auto_resize_text";
  const lineHeight = fontSize * 1.2 * scaleFactor;
  const maxHeight = isAutoResize && frontendNumberOfRow ? lineHeight * frontendNumberOfRow : undefined;

  return (
    <>
      {isAutoResize ?
        <div
          ref={containerRef}
          style={{
            width: `${width * scaleFactor}px`,
            height: maxHeight ? `${maxHeight}px` : "auto",
            overflow: "hidden",
            textAlign: alignment,
            textTransform: isCapsLocks ? "uppercase" : "none",
            borderLeft: border?.left ? `${border.width * scaleFactor}px ${border.style}` : "none",
            borderRight: border?.right ? `${border.width * scaleFactor}px ${border.style}` : "none",
            borderTop: border?.top ? `${border.width * scaleFactor}px ${border.style}` : "none",
            borderBottom: border?.bottom ? `${border.width * scaleFactor}px ${border.style}` : "none",
          }}
        >
          <div
            ref={contentRef}
            style={{
              fontSize: `${isAutoResize
                ? value?.length > 160
                  ? (fontSize * scaleFactor) - 3
                  : value?.length > 130
                    ? (fontSize * scaleFactor) - 2
                    : value?.length > 100
                      ? (fontSize * scaleFactor) - 1
                      : (fontSize * scaleFactor)
                : fontSize * scaleFactor
                }px`,
              fontWeight: isBold ? "600" : "normal",
              fontStyle: isItalics ? "italic" : "normal",
              wordBreak: "break-all",
              overflowWrap: "anywhere",
              whiteSpace: "normal",
              lineHeight: 1.2,
            }}
          >
            {value ?? <span style={{ color: "transparent" }}>-</span>}
          </div>
        </div>
        :
        <div
          style={{
            fontSize: `${fontSize * scaleFactor}px`,
            fontWeight: isBold ? "600" : "normal",
            fontStyle: isItalics ? "italic" : "normal",
            textAlign: alignment,
            width: `${width * scaleFactor}px`,
            textTransform: isCapsLocks ? "uppercase" : "none",
            overflow: "clip",
            borderLeft: border?.left ? `${border.width * scaleFactor}px ${border.style}` : "none",
            borderRight: border?.right ? `${border.width * scaleFactor}px ${border.style}` : "none",
            borderTop: border?.top ? `${border.width * scaleFactor}px ${border.style}` : "none",
            borderBottom: border?.bottom ? `${border.width * scaleFactor}px ${border.style}` : "none",
            //fore direct print i make
            // height: "30px"
          }}
        >
          {/* When there is no text, something should be printed so that the borderBottom doesn't move up */}
          {value ?? <div className="text-white"></div>}
        </div>}
    </>


  );
};



// import { ValueBlockProps } from "./type";

// interface Props {
//   blockProps: ValueBlockProps | any;
//   scaleFactor?: number;
// }

// export const ValueBlock: React.FC<Props> = ({ blockProps, scaleFactor = 1 }) => {
//   const { value, isBold, width, frontendConditionValue, frontendNumberOfRow, isItalics, fontSize, alignment, border, isCapsLocks, hideKey, hideValue, ...rest } =
//     blockProps;

//   if (hideKey && hideValue && rest[hideKey] === hideValue) {
//     // Don't render the block if HideKey and hideValue match
//     return null;
//   }
//   const isAutoResize = frontendConditionValue === "auto_resize_text";
//   const lineHeight = fontSize * 1.2 * scaleFactor;
//   const maxHeight = isAutoResize && frontendNumberOfRow ? lineHeight * frontendNumberOfRow : undefined;
//  console.log(maxHeight,"maxHeightmaxHeightmaxHeight")
//   return (
//     <div
//       style={{
//         // height: maxHeight ? `${maxHeight}px` : "auto",
//         // fontSize: `${fontSize * scaleFactor}px`,
//         fontWeight: isBold ? "600" : "normal",
//         fontStyle: isItalics ? "italic" : "normal",
//         textAlign: alignment,
//         width: `${width * scaleFactor}px`,
//         textTransform: isCapsLocks ? "uppercase" : "none",
//         overflow: "clip",
//         borderLeft: border?.left ? `${border.width * scaleFactor}px ${border.style}` : "none",
//         borderRight: border?.right ? `${border.width * scaleFactor}px ${border.style}` : "none",
//         borderTop: border?.top ? `${border.width * scaleFactor}px ${border.style}` : "none",
//         borderBottom: border?.bottom ? `${border.width * scaleFactor}px ${border.style}` : "none",
//         fontSize: `${isAutoResize
//           ? value?.length > 160
//             ? (fontSize * scaleFactor) - 3
//             : value?.length > 130
//               ? (fontSize * scaleFactor) - 2
//               : value?.length > 100
//                 ? (fontSize * scaleFactor) - 1
//                 : (fontSize * scaleFactor)
//           : fontSize * scaleFactor
//           }px`,
//         wordBreak: "break-all",
//         overflowWrap: "anywhere",
//         whiteSpace: "normal",
//         //fore direct print i make
//         // height: "30px"
//       }}
//     >
//       {/* When there is no text, something should be printed so that the borderBottom doesn't move up */}
//       {value ?? <div className="text-white"></div>}
//     </div>
//   );
// };
