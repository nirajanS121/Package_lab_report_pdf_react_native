import React from "react";
import WatermarkOverlay from "./WatermarkOverlay";
import { v4 as uuidv4 } from "uuid";
import ExeBlockRender from "../exe-block-render";
import { isColorWatermark, isImageWatermark } from "../type-guard";
import BlockRender from "../block-render";
interface Props {
  config: any;
  headerImage?: any;
  footerImage?: any;
  watermark?: any;
  headerBlocks: any[];
  footerBlocks: any[];
  contentBlock: React.ReactNode;
  contentX: number;
  contentY: number;
  suffix?: React.ReactNode | null;
  totalPages: number;
  onlyPreviewWatermark?: boolean;
  logoImage?: any;
  isVerifyEmail?: boolean;
  printTextWaterMark?: any;
  orientationNotSet?: boolean;
  isExePrint?: boolean;
  currentPage?: number;
  previewWatermarkObject?: any;
  processedUsernames?: any
  footerNotFixedForceFully?: any
}

export const PageRender: React.FC<Props> = (props) => {
  const {
    orientationNotSet,
    logoImage,
    headerImage,
    footerImage,
    printTextWaterMark,
    watermark,
    suffix,
    totalPages,
    onlyPreviewWatermark,
    isVerifyEmail,
    isExePrint,
    previewWatermarkObject,
    processedUsernames,
    footerNotFixedForceFully
    // currentPage,
  } = props;
  console.log(processedUsernames, orientationNotSet, "processedUsernamesprocessedUsernamesprocessedUsernames")
  // console.log(printTextWaterMark,"printTextWaterMarkprintTextWaterMark")
  // console.log(headerImage,"headerImageheaderImageheaderImageheaderImage")

  const { headerBlocks, footerBlocks, contentBlock, contentX, config } = props;
  // !isVerifyEmail
  // !isVerifyEmail
  const { height, width, header, footer } = config;
  const headerImageHeight =
    headerImage && config?.printPreference?.printWithImage
      ? (width / headerImage?.width) * headerImage?.height
      : 0;
  const footerImageHeight =
    footerImage && config?.printPreference?.printWithImage
      ? (width / footerImage?.width) * footerImage?.height
      : 0;
  const headerHeight = header?.isEnabled ? header?.height : headerImageHeight;
  const footerHeight = footer?.isEnabled ? footer?.height : footerImageHeight;
  const footerStart = height - footerHeight;

  // Watermark opacity should be decreased by the factor of page length; as the watermark's stack for every page
  const watermarkOpacity = (config?.watermark?.opacity ?? 0) * (0.01 / totalPages);
  const defaultPrintPreference: any = {
    printWithImage: false,

    isMarginEnabled: false,
    isFooterFixed: false,
  };

  const printPreference = config?.printPreference ?? defaultPrintPreference;
  const calculateWatermarkSize = (config: any, watermark: any) => {
    const paperMinDimension = Math.min(config?.width, config?.height);

    const watermarkWidth = paperMinDimension * 0.9;

    const watermarkHeight = (watermarkWidth / watermark?.width) * watermark?.height;

    return { watermarkWidth, watermarkHeight };
  };

  const { watermarkWidth, watermarkHeight } = calculateWatermarkSize(config, watermark);
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    window.onbeforeprint = () => {
      document.querySelectorAll("img").forEach((img) => {
        if (img.loading === "lazy") img.loading = "eager";
      });
    };
  }
  console.log(headerImage, "headerImageheaderImage")
  const dynamicCalculateHeight = config?.header?.height;
  const dynamicCalculateFooter = config?.footer?.height;
  //@ts-ignore
  const getCurrentFooterSign = uuidv4();
  const getCurrentFooterSignHeader = uuidv4();
  console.log(getCurrentFooterSign, getCurrentFooterSignHeader, "getCurrentFooterSignHeadergetCurrentFooterSignHeader")
  console.log(getCurrentFooterSign, "getCurrentFooterSigngetCurrentFooterSigngetCurrentFooterSigngetCurrentFooterSign")

  console.log(printPreference.last_page_footer_only, "printPreference.isFooterFixed")
  console.log(footerStart, "footerStartfooterStartfooterStartfooterStart")
  console.log(footer?.isEnabled, "footer?.isEnabled")
  console.log(printPreference?.second_page_margin, "configconfigconfig")
  //   <style>
  //   {`
  // @media print {
  // @page {
  // size: ${config?.width}px ${config?.height}px;
  // aspect-ratio: 2 / 3;
  // margin: 0;
  // @bottom-right {
  // content: "Page: " counter(page) " of " counter(pages);
  // font-size: 8px;
  // padding-right:10px;
  // color: #000000;
  // }

  // }
  // `}
  // </style>
  // console.log(printPreference?.printWithImage, "printPreference?.printWithImage printPreference?.printWithImage")
  return (
    <>
      {
        //@ts-ignore
        config?.page_size === "A5" && !orientationNotSet && printPreference?.is_browser_pagination ? (
          <style>
            {`
      @media print {
        @page {
                  size: A5 ${config?.orientation?.toLowerCase()};
          // size: A5 landscape;
          margin: 0.22cm;
           }
        }
 @page {
    @bottom-right {
      content: "Page: " counter(page) " of " counter(pages);
      font-size: 8px;
       margin-bottom:10px;
              padding-right:10px;
      color: #000000;
    }
  }
        `}
          </style>
        ) : (
          //@ts-ignore
          config?.page_size === "A4" &&
          !orientationNotSet && printPreference?.is_browser_pagination && (
            <style>
              {`
                 @page {
    @bottom-right {
      content: "Page: " counter(page) " of " counter(pages);
      font-size: 14px;
      // margin-bottom:40px;
      // padding-right:15px;
      color: #000000;
    }
  }

  `}
            </style>
          )
        )}
      <div
        style={{
          // minHeight: config.height,
          maxWidth: config?.width,
          width: config?.width,
          pageBreakAfter: "auto",
          ...(printPreference?.isFooterFixed && { position: "relative" }),
          backgroundColor:
            watermark && isColorWatermark(watermark) && config.printPreference?.printWithImage && !isVerifyEmail
              ? watermark.name
              : "white",
          // fontFamily: "Verdana",
        }}
      // className="font-verdana"
      >
        {config.page_size === "A4" && printPreference?.is_browser_pagination && <></>}
        {(onlyPreviewWatermark ||
          printTextWaterMark) && (
            <WatermarkOverlay
              show={onlyPreviewWatermark ||
                printTextWaterMark}
              text={printTextWaterMark ?? "PREVIEW"}
              fontSize={previewWatermarkObject?.fontSize ?? 26}
              opacity={previewWatermarkObject?.opacity ?? 0.2}
              rotation={previewWatermarkObject?.rotation ?? -45}
              gapX={previewWatermarkObject?.gapX ?? 200}
              gapY={previewWatermarkObject?.gapY ?? 120}
            />
          )}
        {watermark && printPreference.printWithImage && !isVerifyEmail && isImageWatermark(watermark) && (
          <img
            src={watermark.name}
            width={watermarkWidth}
            height={watermarkHeight}
            loading="lazy"
            // alt="Watermark"
            style={{
              position: "fixed",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              objectFit: "contain",
              objectPosition: "center",
              opacity: watermarkOpacity,
              pointerEvents: "none",
              zIndex: 9999,
            }}
          />
        )}
        {config.page_size === "A4" && !onlyPreviewWatermark && !isVerifyEmail && (
          <div
            style={{
              fontSize: "16px",
            }}
          >
            <div className={`${config.page_size === "A4" && !onlyPreviewWatermark && `header-${getCurrentFooterSignHeader}`} `}>
              <div
                style={{
                  height: onlyPreviewWatermark
                    ? "auto"
                    : printPreference.isFooterFixed && !suffix
                      ? headerHeight - 19
                      : footer?.isEnabled && !isVerifyEmail && footerImage?.name && !suffix
                        ? headerHeight + 25
                        : headerHeight,
                  width: "100%",
                  position: "relative",
                }}
              >
                {header?.isEnabled && !isVerifyEmail && headerImage?.name && printPreference.printWithImage && (
                  <>
                    <img
                      src={headerImage.name}
                      width={headerImage.width}
                      height={headerImage.height}
                      loading="lazy"
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        zIndex: 0,
                        objectFit: "cover",
                        objectPosition: "center",
                        // transform: `scale(${width / headerImage.width})`,
                        transformOrigin: "top left",
                      }}
                    // alt="Header"
                    />
                  </>
                )}
                {!onlyPreviewWatermark &&
                  headerBlocks?.map((block) => (
                    <div
                      key={block.key}
                      style={{
                        left: `${block.x}px`,
                        top: `${block.y}px`,
                        boxSizing: "border-box",
                        whiteSpace: "nowrap",
                        textAlign: "center",
                        position: "absolute",
                        display: block.isVisible ? "block" : "none",
                      }}
                    >
                      {isExePrint ? (
                        <ExeBlockRender block={block} logoImage={logoImage} maxWidth={width} />
                      ) : (
                        <BlockRender block={block} logoImage={logoImage} maxWidth={width} />
                      )}
                    </div>
                  ))}
              </div>
            </div>
            {!printPreference?.last_page_footer_only && (
              <div className={`${config.page_size === "A4" && `footer-${getCurrentFooterSign}`}`}>
                <div>
                  {!onlyPreviewWatermark && (
                    <div
                      style={{
                        height: printPreference.isFooterFixed
                          ? "auto"
                          : footer?.isEnabled && !isVerifyEmail && footerImage?.name
                            ? footerHeight - footerImageHeight
                            : footerHeight,
                        // bottom: printPreference.isFooterFixed ? "auto" : "auto",
                        width: width,
                        // position: "relative",
                        ...(footer?.isEnabled &&
                          !isVerifyEmail &&
                          !suffix &&
                          footerImage?.name &&
                        {
                          // top: -25,
                        }),
                      }}
                    >
                      <>
                        {footerBlocks?.map((block) => (
                          <div
                            key={block.key}
                            style={{
                              left: `${block.x}px`,
                              top: `${block.y}px`,
                              boxSizing: "border-box",
                              whiteSpace: "nowrap",
                              textAlign: "center",
                              position: "absolute",
                              display: block.isVisible ? "block" : "none",
                            }}
                          >
                            {isExePrint ? (
                              <ExeBlockRender block={block} maxWidth={width} />
                            ) : (
                              <BlockRender block={block} maxWidth={width} />
                            )}
                          </div>
                        ))}
                      </>
                    </div>
                  )}
                  {onlyPreviewWatermark && (
                    <div
                      style={{
                        height: "1.5px",
                        backgroundColor: "#ccc",
                        margin: "20px 0",
                        width: "100%",
                      }}
                    />
                  )}
                </div>
                {footer?.isEnabled &&
                  footerImage?.name &&
                  printPreference?.printWithImage &&
                  !isVerifyEmail &&
                  !onlyPreviewWatermark && (
                    <>
                      <img
                        src={footerImage?.name}
                        width={footerImage?.width}
                        height={footerImage?.height}
                        loading="lazy"
                        // alt="Footer"
                        style={{
                          position: "fixed",
                          bottom: 0,
                          left: 0,
                          zIndex: 0,
                          objectFit: "cover",
                          objectPosition: "center",
                          // transform: `scale(${width / footerImage?.width})`,
                          transformOrigin: "bottom left",
                        }}
                      />

                    </>
                  )}
              </div>
            )}
          </div>
        )}
        <table
          className={`${config.page_size === "A4" && "print-table"}`}
          style={{
            width: width,
          }}
        >
          <>
            {!onlyPreviewWatermark && (
              <thead className="w-full">
                {config.page_size === "A4" && !isVerifyEmail ? (
                  <tr>
                    <td>
                      <div className={`${config.page_size === "A4" && !onlyPreviewWatermark && `header-space-${getCurrentFooterSignHeader}`}`}></div>
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td
                      style={{
                        height:
                          printPreference.isFooterFixed && !suffix
                            ? headerHeight - 19
                            : footer?.isEnabled && footerImage && !suffix
                              ? headerHeight + 25
                              : headerHeight,
                        width: "100%",
                        position: "relative",
                      }}
                    >
                      {header?.isEnabled && headerImage?.name && (printPreference.printWithImage || isVerifyEmail)
                        //  && !isVerifyEmail
                        && (
                          <>
                            <div
                              style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: headerImage.width,
                                height: headerImage.height,
                                zIndex: 0,
                                backgroundImage: `url("${headerImage.name}")`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                backgroundRepeat: "no-repeat",
                                transform: `scale(${width / headerImage.width})`,
                                transformOrigin: "top left",
                              }}
                            />
                          </>
                        )}

                      {headerBlocks?.map((block) => (
                        <div
                          key={block.key}
                          style={{
                            left: `${block.x}px`,
                            top: `${block.y}px`,
                            boxSizing: "border-box",
                            whiteSpace: "nowrap",
                            textAlign: "center",
                            position: "absolute",
                            display: block.isVisible ? "block" : "none",
                          }}
                        >
                          {isExePrint ? (
                            <ExeBlockRender block={block} logoImage={logoImage} maxWidth={width} />
                          ) : (
                            <BlockRender block={block} logoImage={logoImage} maxWidth={width} />
                          )}
                        </div>
                      ))}
                    </td>
                  </tr>
                )}
              </thead>
            )}
            <>
              <tbody
                style={{
                  ...(printPreference.isFooterFixed &&
                  {
                    // minHeight: `${config?.height - contentY - footerHeight}px`,
                    // maxHeight: `100%`,
                    // verticalAlign: "top",
                    // display: "flex",
                    // flexDirection: "column",
                  }),
                  ...(footer?.isEnabled &&
                    !isVerifyEmail &&
                    !suffix &&
                    footerImage?.name &&
                  {
                    // position: "relative",
                    // top: -25,
                  }),
                }}
              >
                <>
                  <tr>
                    <td>
                      <div
                        className="content-body"
                        style={{
                          paddingLeft: `${contentX}px`,
                          textAlign: "center",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                          }}
                        >
                          {contentBlock}
                          {suffix && <div style={{ marginLeft: 8 }}>{suffix}</div>}
                        </div>

                      </div>
                    </td>
                  </tr>
                </>
              </tbody>
              {!onlyPreviewWatermark && (
                <tfoot className="w-full">

                  {config.page_size === "A4" && !isVerifyEmail ? (
                    !printPreference?.last_page_footer_only && (
                      <tr>
                        <td>
                          <div className={`${config.page_size === "A4" && `footer-space-${getCurrentFooterSign}`}`}></div>
                        </td>
                      </tr>
                    )
                  ) : (
                    <tr>
                      <td
                        style={{
                          height: printPreference.isFooterFixed
                            ? "auto"
                            : footer?.isEnabled && !isVerifyEmail && footerImage?.name
                              ? footerHeight - footerImageHeight
                              : footerHeight,
                          // bottom: printPreference.isFooterFixed ? footerImage?.height : "auto",
                          width: width,
                          position: "relative",
                          ...(footer?.isEnabled &&
                            !isVerifyEmail &&
                            !suffix &&
                            footerImage?.name &&
                          {
                            // top: -25,
                          }),
                        }}
                      >
                        <>
                          {footerBlocks.map((block) => (
                            <div
                              key={block.key}
                              style={{
                                left: `${block.x}px`,
                                top: `${block.y - footerStart}px`,
                                boxSizing: "border-box",
                                whiteSpace: "nowrap",
                                textAlign: "center",
                                position: "absolute",
                                display: block.isVisible ? "block" : "none",
                              }}
                            >
                              {isExePrint ? (
                                <ExeBlockRender block={block} maxWidth={width} />
                              ) : (
                                <BlockRender block={block} maxWidth={width} />
                              )}
                            </div>
                          ))}
                        </>
                      </td>
                      {onlyPreviewWatermark && (
                        <div
                          style={{
                            height: "1.5px",
                            backgroundColor: "#ccc",
                            margin: "20px 0",
                            width: "100%",
                          }}
                        />
                      )}
                    </tr>
                  )}
                </tfoot>
              )}
            </>
          </>
        </table>

        {footer?.isEnabled &&
          footerImage?.name &&
          (printPreference.printWithImage || isVerifyEmail) &&
          // !isVerifyEmail &&
          !onlyPreviewWatermark && (
            <>
              <img
                src={footerImage?.name}
                width={footerImage?.width}
                height={footerImage?.height}
                loading="lazy"
                // alt="Footer"
                style={{
                  position: "fixed",
                  bottom: 0,
                  left: 0,
                  zIndex: 0,
                  objectFit: "cover",
                  objectPosition: "center",
                  transform: `scale(${width / footerImage?.width})`,
                  transformOrigin: "bottom left",
                }}
              />
            </>
          )}
      </div>

      {config?.page_size === "A4" && (
        <style>
          {`
        .print-table {
          width: 100%;
          border-collapse: collapse;
          margin: 0;
          padding: 0;
          font-family: Verdana !important;
        }

        .print-table td {
          padding: 0;
          font-family: Verdana !important;
        }
      .header-space-${getCurrentFooterSignHeader} {
          height: ${dynamicCalculateHeight + 10}px;
        }
   
        .footer-space-${getCurrentFooterSign} {
           height: ${dynamicCalculateFooter}px !important;
        }
        @media print {
          body, p, h1, h2, h3, h4, h5, h6, span, a, li, td, th, input, textarea, button {
            font-family: Verdana !important;
            // line-height:14px;
          }

        .header-${getCurrentFooterSignHeader} {
            display: block;
            position: fixed;
            left: 0;
            right: 0;
            background: white;
            text-align: center;
          }

        .footer-${getCurrentFooterSign} {
            display: block;
            position: ${!footerNotFixedForceFully && "fixed"};
            left: 0;
            right: 0;
            background: white;
            text-align: center;
          }

        }
      `}
        </style>
      )}
    </>
  );
};

// .header-${getCurrentFooterSignHeader}-${getCurrentFooterSignHeader} {
//   top: 0;
//   height: ${dynamicCalculateHeight}px;
// }

// .footer-${getCurrentFooterSign}-${getCurrentFooterSign} {
//   bottom: 0;
//   height: ${dynamicCalculateFooter}px;
// }
