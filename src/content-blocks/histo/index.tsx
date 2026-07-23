import { HistoContentBlockProps } from "./type";
import BlockRender from "../../block-render";

interface Props {
  blockProps: HistoContentBlockProps;
  scaleFactor?: number;
  maxWidth: number;
  isTitleDescHorizontal?: boolean;
  lastPageContent?: any;
  printPreference?: any;
  config?: any;
  isVerifyEmail?: any;
  footerImage?: any;
  footerBlocks?: any;
}

export const HistoContentBlock: React.FC<Props> = (props) => {
  const {
    blockProps,
    scaleFactor = 1,
    maxWidth,
    isTitleDescHorizontal,
    lastPageContent,
    printPreference,
    config,
    isVerifyEmail,
    footerImage,
    footerBlocks,
  } = props;
  const { title, subtitle, data } = blockProps;
  const height = config?.height ?? 0;
  const width = config?.width ?? 0;
  const footer = config?.footer;

  const footerImageHeight =
    footerImage && !isVerifyEmail && config?.printPreference?.printWithImage
      ? (width / (footerImage?.width ?? 1)) * (footerImage?.height ?? 0)
      : 0;

  const footerHeight = footer?.isEnabled
    ? (footer?.height ?? 0)
    : footerImageHeight;

  const blocks = footerBlocks?.filter((row: any) => row?.isVisible);
  const minY =
    Array.isArray(blocks) && blocks.length > 0
      ? Math.min(
          ...blocks
            .map((block: any) =>
              typeof block?.y === "number" ? block.y : Infinity,
            )
            .filter((y) => y !== Infinity),
        )
      : 0;
  return (
    <div style={{ width: maxWidth * scaleFactor }}>
      <div
        className="flex items-center justify-center uppercase underline"
        style={{ fontWeight: 800 }}
      >
        {title ?? ""}
      </div>
      <div className="flex items-center justify-center mb-3 text-[11px] p-2 break-all whitespace-pre-wrap">
        {subtitle ?? ""}
      </div>

      <div>
        {data && data.length > 0
          ? data.map((item, index) => {
              const isLast = data.length === index + 1;
              const isFirst = index === 0;

              const getBorderStyle = (border: any, x?: number) => {
                if (!border) return "";
                const sides = ["top", "right", "bottom", "left"];
                const borderStyles = sides
                  .map((side) =>
                    border[side]
                      ? `border-${side}: ${border.width}px ${border.style} black;`
                      : "",
                  )
                  .join(" ");

                const marginLeft = x ? `margin-left: ${x}px;` : "";

                return `${borderStyles} ${marginLeft}`;
              };

              const extraContent = isLast
                ? (lastPageContent || [])
                    .map((content: any) => {
                      const { value, border } = content;
                      return `
                    <br/><br/><br/><br/><br/>
                    <div style="text-align: center;">
                      <div style="${getBorderStyle(border)} padding: 5px; display: inline-block;">
                 <span style="white-space: pre;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>      <span style="white-space: pre;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span> <span style="white-space: pre;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>     <span style="white-space: pre;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span> <span style="white-space: pre;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>${value}
                      </div>
                    </div>
                  `;
                    })
                    .join("")
                : "";

              const finalDescription = `${item?.description || ""}${extraContent}`;

              return (
                <div>
                  <div
                    key={index}
                    className={`${isTitleDescHorizontal ? "flex flex-wrap" : ""}`}
                  >
                    {item?.title && (
                      <>
                        <div
                          className={` ${isTitleDescHorizontal ? "w-3/10" : "w-full"} ${!isFirst && "mt-[10px] mb-[1px]"} `}
                          style={{
                            wordWrap: "break-word",
                            whiteSpace: "normal",
                            pageBreakInside: "avoid",
                            textAlign: "left",
                            width: isTitleDescHorizontal ? "30%" : "100%",
                          }}
                        >
                          <div
                            className="ck-content-html"
                            dangerouslySetInnerHTML={{ __html: item?.title }}
                          />
                        </div>
                      </>
                    )}
                    {finalDescription && (
                      <div
                        className={` ${isTitleDescHorizontal ? "w-7/10 text-right" : "w-full"}`}
                        style={{
                          wordWrap: "break-word",
                          whiteSpace: "normal",
                          direction: isTitleDescHorizontal ? "rtl" : "ltr",
                          textAlign: isTitleDescHorizontal ? "right" : "left",
                          width: isTitleDescHorizontal ? "70%" : "100%",
                        }}
                      >
                        <div
                          className="ck-content-html"
                          dangerouslySetInnerHTML={{ __html: finalDescription }}
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    {printPreference?.last_page_footer_only &&
                      isLast &&
                      !isVerifyEmail &&
                      config && (
                        <div
                          style={{
                            top: `${height - minY}px`,
                            position: "relative",
                          }}
                        >
                          <>
                            {footerBlocks?.map((block: any) => (
                              <div
                                key={block.key}
                                style={{
                                  left: `${block.x}px`,
                                  bottom: 0,
                                  position: "absolute",
                                  boxSizing: "border-box",
                                  whiteSpace: "nowrap",
                                  textAlign: "center",
                                  display: block.isVisible ? "block" : "none",
                                }}
                              >
                                <BlockRender block={block} maxWidth={width} />
                              </div>
                            ))}
                          </>
                        </div>
                      )}
                  </div>
                </div>
              );
            })
          : "No data provided"}
      </div>
    </div>
  );
};
