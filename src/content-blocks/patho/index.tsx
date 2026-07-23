import { PathoContentBlockProps } from "./type";
import { isDataRow, isHeadingRow } from "./utils";
import { groupAntibiotics } from "../../helper";

interface Props {
  blockProps: PathoContentBlockProps | any;
  scaleFactor?: number;
  maxWidth: number;
  isFooterFixed?: boolean;
  lineHeight?: boolean;
  onlyPreviewWatermark?: boolean;
  lastPageContent?: any;
  config?: any;
}
export const PathoContentBlock: React.FC<Props> = (props) => {
  const {
    blockProps,
    scaleFactor = 1,
    isFooterFixed = false,
    onlyPreviewWatermark = false,
    lastPageContent,
  } = props;
  const {
    title,
    data,
    tableColumns = [],
    tableWidth,
    endNoteConfig,
    commentsConfig,
    config,
  } = blockProps;

  const totalColumnWidth = tableColumns.reduce((sum: any, column: any) => {
    return sum + (column.configColumn.columnWidth || 0);
  }, 0);
  const updateMaxWidth = tableWidth ?? totalColumnWidth;
  const getTextStyle = (config: any, isHeader: boolean = false) => {
    const styleConfig = isHeader ? config.headerFormate : config.bodyFormate;
    return {
      fontWeight: styleConfig?.isBold ? "bold" : "normal",
      fontStyle: styleConfig?.isItalics ? "italic" : "normal",
      textTransform: styleConfig?.isCapsLocks ? "uppercase" : "none",
      fontSize:
        (styleConfig[isHeader ? "headerFontSize" : "bodyFontSize"] || 12) *
        scaleFactor,
      textAlign: config?.alignment || "left",
      padding: "2px 5px",
    };
  };

  const getNoteCommentStyle = (config: any) => {
    return {
      fontWeight: config?.isBold ? "bold" : "normal",
      fontStyle: config?.isItalics ? "italic" : "normal",
      textTransform: config?.isCapsLocks ? "uppercase" : "none",
      fontSize: (config?.fontSize || 12) * scaleFactor,
      textAlign: "left",
      padding: "0 5px",
    };
  };

  const hasUnitRef = !data?.[0]?.data?.[0]?.hideUnitRef;
  return (
    <div
      style={{
        width: (updateMaxWidth - 15) * scaleFactor,
        fontSize: 14 * scaleFactor,
        padding: "4px",
      }}
    >
      <div
        style={{
          textAlign: "center",
          textTransform: "uppercase",
          fontWeight: 700,
        }}
      >
        {title}
      </div>

      <div
        style={{
          display: "flex",
          border: "1px solid #000000",
          fontWeight: 600,
          pageBreakInside: "avoid",
          borderCollapse: "collapse",
        }}
      >
        {tableColumns.map((col: any, idx: any) => (
          <div
            key={idx}
            style={{
              width: col.configColumn.columnWidth,
              ...getTextStyle(col.configColumn, true),
            }}
          >
            {col.value}
          </div>
        ))}
        {hasUnitRef && onlyPreviewWatermark && (
          <>
            <div style={{ width: "80px", textAlign: "start" }}>
              Result Entry By
            </div>
            <div style={{ width: "80px", textAlign: "start" }}>Verified By</div>
          </>
        )}
      </div>

      <div>
        {data?.map((profile: any, index: any) => {
          const previousTitle =
            index > 0 ? data?.[index - 1]?.department_name : null;

          return (
            <div key={index}>
              {profile?.department_name &&
                previousTitle !== profile?.department_name &&
                index !== 0 && (
                  <div
                    style={{
                      pageBreakInside: "avoid",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      fontWeight: 700,
                      textTransform: "uppercase",
                    }}
                  >
                    {profile?.department_name}
                  </div>
                )}

              {profile.title && (
                <div
                  style={{
                    paddingLeft: 5,
                    pageBreakInside: "avoid",
                    display: "flex",
                    alignItems: "center",
                    border: "1px solid #aaa9a9",
                    fontWeight: 600,
                    padding: "4px",
                  }}
                >
                  {profile.title}
                </div>
              )}

              <div>
                {profile.data?.map((item: any, i: number) => (
                  <div key={i}>
                    {item?.type === "department_heading" && item?.title && (
                      <div
                        style={{
                          pageBreakInside: "avoid",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          padding: "2px",
                        }}
                      >
                        {item?.title}
                      </div>
                    )}

                    {isHeadingRow(item) && (
                      <div
                        style={{
                          paddingLeft: 5 + 20 * item.level,
                          pageBreakInside: "avoid",
                          display: "flex",
                          alignItems: "center",
                          border: "1px solid #aaa9a9",
                          fontWeight: 600,
                          fontStyle: "italic",
                          padding: "2px",
                        }}
                      >
                        {item.title}
                      </div>
                    )}

                    <div
                      style={
                        isFooterFixed
                          ? { pageBreakBefore: "auto" }
                          : { pageBreakInside: "avoid" }
                      }
                    >
                      {isDataRow(item) && (
                        <div
                          style={{
                            display: "flex",
                            border: "1px solid #aaa9a9",
                            borderCollapse: "collapse",
                            padding: "2px",
                          }}
                        >
                          {tableColumns.map((col: any, idx: number) => {
                            const isOrganism =
                              item.result_type === "organism" ||
                              item.result_type === "freetext";
                            const hasUnitValue = !!item.unit;
                            const hasRefValue = !!item.referenceRange;

                            const skipUnit =
                              isOrganism &&
                              !hasUnitValue &&
                              (item.result?.length ?? 0) > 20;
                            const skipRef =
                              isOrganism &&
                              !hasRefValue &&
                              (item.result?.length ?? 0) > 20;
                            const unitColumnWidth =
                              tableColumns.find(
                                (c: any) => c.valueKey === "unit",
                              )?.configColumn?.columnWidth ?? 0;
                            const refColumnWidth =
                              tableColumns.find(
                                (c: any) => c.valueKey === "referenceRange",
                              )?.configColumn?.columnWidth ?? 0;
                            let adjustedWidth = col.configColumn.columnWidth;

                            if (col.valueKey === "result") {
                              adjustedWidth +=
                                (skipUnit ? unitColumnWidth : 0) +
                                (skipRef ? refColumnWidth : 0);
                            }
                            if (
                              (col.valueKey === "unit" && skipUnit) ||
                              (col.valueKey === "referenceRange" && skipRef)
                            ) {
                              return null;
                            }

                            if (
                              !hasUnitRef &&
                              (col.valueKey === "unit" ||
                                col.valueKey === "referenceRange")
                            ) {
                              return null;
                            }

                            if (col.valueKey === "result") {
                              return (
                                <div
                                  key={idx}
                                  style={{
                                    width: adjustedWidth,
                                    ...getTextStyle(col.configColumn),
                                    ...(skipUnit && { textAlign: "center" }),
                                  }}
                                >
                                  <div
                                    style={{
                                      fontWeight:
                                        item.flag === "H" ||
                                        item.flag === "L" ||
                                        item.flag === "CL" ||
                                        item.flag === "CH" ||
                                        item?.abnormal === true
                                          ? 800
                                          : "inherit",
                                    }}
                                  >
                                    <span
                                      dangerouslySetInnerHTML={{
                                        __html: item.result,
                                      }}
                                    />
                                    {item?.showFlag ? `[${item?.flag}]` : ""}
                                  </div>
                                </div>
                              );
                            }

                            if (
                              col.valueKey === "unit" &&
                              hasUnitRef &&
                              !skipUnit
                            ) {
                              return (
                                <div
                                  key={idx}
                                  style={{
                                    width: adjustedWidth,
                                    ...getTextStyle(col.configColumn),
                                  }}
                                >
                                  {item.unit ?? "-"}
                                </div>
                              );
                            }

                            if (
                              col.valueKey === "referenceRange" &&
                              hasUnitRef &&
                              !skipRef
                            ) {
                              return (
                                <div
                                  key={idx}
                                  style={{
                                    width: adjustedWidth,
                                    ...getTextStyle(col.configColumn),
                                  }}
                                >
                                  {item.result_type === "freetext" &&
                                  item.freetext_range ? (
                                    <div
                                      dangerouslySetInnerHTML={{
                                        __html: item.freetext_range,
                                      }}
                                      className="text-[10px]"
                                    />
                                  ) : (
                                    (item.referenceRange ?? "-")
                                  )}
                                </div>
                              );
                            }
                            let value = item[col.valueKey] ?? "-";
                            return (
                              <div
                                key={idx}
                                style={{
                                  width: adjustedWidth,
                                  ...getTextStyle(col.configColumn),
                                }}
                              >
                                <div
                                  style={{
                                    pageBreakInside: "auto",
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      textAlign: "start",
                                      width: `auto`,
                                      wordWrap: "break-word",
                                      whiteSpace: "normal",
                                      overflowWrap: "anywhere",
                                    }}
                                  >
                                    {value}
                                  </div>
                                  {(item?.specimen_name || item?.method) && (
                                    <div style={{ fontSize: 8 }}>
                                      {item?.specimen_name && (
                                        <>{item.specimen_name}</>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                          {hasUnitRef && onlyPreviewWatermark && (
                            <>
                              <div
                                style={{
                                  width: "80px",
                                  textAlign: "start",
                                  fontSize: "10px",
                                }}
                              >
                                {item?.finding_posted_user_name ?? "-"}
                              </div>
                              <div
                                style={{
                                  width: "80px",
                                  textAlign: "start",
                                  fontSize: "10px",
                                }}
                              >
                                {item?.verified_user_name ?? "-"}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                      <AntibioticDisplay
                        antibiotic_results={item?.antibiotic_results ?? []}
                        level={item.level + 1}
                      />

                      {item.comment && (
                        <div
                          style={{
                            height: "25px",
                            padding: "0 5px",
                            borderLeft: "1px solid #aaa9a9",
                            borderRight: "1px solid #aaa9a9",
                            borderBottom: "1px solid #aaa9a9",
                          }}
                        >
                          <div style={getNoteCommentStyle(commentsConfig)}>
                            Comment :
                          </div>
                          <div
                            style={{
                              whiteSpace: "normal",
                              overflowWrap: "anywhere",
                              textAlign: "left",
                              padding: "0 5px",
                            }}
                          >
                            <div style={{ marginTop: -8 }}>
                              <div
                                className="ck-content-html"
                                dangerouslySetInnerHTML={{
                                  __html: item.comment,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {item.endnote && (
                        <div style={{ margin: "6px 0" }}>
                          <div
                            style={{
                              wordWrap: "break-word",
                              overflowWrap: "anywhere",
                              textAlign: "left",
                            }}
                          >
                            <div style={getNoteCommentStyle(endNoteConfig)}>
                              {item.display_nameEndnote || "EndNote"} :
                            </div>
                            <div style={{ border: "1px solid #aaa9a9" }}>
                              <div
                                className="ck-content-html"
                                dangerouslySetInnerHTML={{
                                  __html: item.endnote,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {profile.remarks && (
                <div
                  style={{
                    pageBreakInside: "avoid",
                    padding: "0 4px",
                    borderBottom: "1px solid #aaa9a9",
                  }}
                >
                  <div style={{ textAlign: "start", fontWeight: 600 }}>
                    {profile.title} Remarks :
                  </div>
                  <div
                    dangerouslySetInnerHTML={{ __html: profile.remarks }}
                    style={{ textAlign: "justify" }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface ColumnContainerProps {
  children: React.ReactNode;
  width: number;
  minWidth: number;
}

export const ColumnContainer: React.FC<ColumnContainerProps> = (props) => {
  const { children, width } = props;

  return (
    <div
      style={{
        display: "flex",
        textAlign: "start",
        width: `${width}%`,
        wordWrap: "break-word",
        whiteSpace: "normal",
        overflowWrap: "anywhere",
      }}
    >
      {children}
    </div>
  );
};

export const AntibioticDisplay = ({ antibiotic_results }: any) => {
  const { sensitive, resistant, partiallyResistant } =
    groupAntibiotics(antibiotic_results);
  return (
    <>
      {antibiotic_results.length > 0 && (
        <div>
          <div>
            <table
              style={{
                width: "100%",
                tableLayout: "fixed",
              }}
            >
              <thead
                style={{
                  borderBottom: "1px solid #aaa9a9",
                }}
              >
                <tr>
                  {sensitive.length > 0 && (
                    <th
                      style={{
                        textAlign: "center",
                        padding: "4px 8px",
                        borderRight: "1px solid #aaa9a9",
                        borderLeft: "1px solid #aaa9a9",
                      }}
                    >
                      Sensitive
                    </th>
                  )}
                  {resistant.length > 0 && (
                    <th
                      style={{
                        textAlign: "center",
                        padding: "4px 8px",
                        borderRight:
                          partiallyResistant.length > 0
                            ? "1px solid #aaa9a9"
                            : "",
                      }}
                    >
                      Resistant
                    </th>
                  )}
                  {partiallyResistant.length > 0 && (
                    <th
                      style={{
                        textAlign: "center",
                        padding: "4px 8px",
                        borderRight:
                          partiallyResistant.length > 0
                            ? "1px solid #aaa9a9"
                            : "",
                      }}
                    >
                      Partially Sensitive
                    </th>
                  )}
                </tr>
              </thead>
              <tbody
                style={{
                  borderBottom: "1px solid #aaa9a9",
                }}
              >
                <tr
                  style={{
                    verticalAlign: "top",
                  }}
                >
                  {sensitive.length > 0 && (
                    <td
                      style={{
                        padding: "4px 8px",
                        borderRight: "1px solid #aaa9a9",
                        borderLeft: "1px solid #aaa9a9",
                      }}
                    >
                      {sensitive.map((item: any) => {
                        return (
                          <div
                            style={{
                              fontStyle: "italic",
                              textWrap: "wrap",
                            }}
                          >
                            {item?.name}
                          </div>
                        );
                      })}
                    </td>
                  )}
                  {resistant.length > 0 && (
                    <td
                      style={{
                        padding: "4px 8px",
                        ...(partiallyResistant.length > 0 && {
                          borderRight: "1px solid #aaa9a9",
                        }),
                      }}
                    >
                      {resistant.map((item: any) => {
                        return (
                          <div
                            style={{
                              fontStyle: "italic",
                              textWrap: "wrap",
                            }}
                          >
                            {item?.name}
                          </div>
                        );
                      })}
                    </td>
                  )}
                  {partiallyResistant.length > 0 && (
                    <td
                      style={{
                        padding: "4px 8px",
                        textAlign: "center",
                        borderRight:
                          partiallyResistant.length > 0
                            ? "1px solid #aaa9a9"
                            : "",
                      }}
                    >
                      {partiallyResistant.map((item: any) => {
                        return (
                          <div
                            style={{
                              fontStyle: "italic",
                              textWrap: "wrap",
                            }}
                          >
                            {item?.name}
                          </div>
                        );
                      })}
                    </td>
                  )}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
};
