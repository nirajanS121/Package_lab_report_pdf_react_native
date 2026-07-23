import { forwardRef } from "react";
import { getDescriptionContent, getTableContent } from "./helper";
import {
  findTemplateForDepartmentType,
  getPages,
  mapValueToBlock,
} from "../helper";
import { PathoContentBlock } from "../content-blocks/patho";
import { HistoContentBlock } from "../content-blocks/histo";
import { PageRender } from "../page-render";

export interface PrintMapperProps {
  headerImage?: any;
  footerImage?: any;
  watermark?: any;

  data?: any;
  table_data?: any;
  signatures?: any;
  pageBreakRule?: any;
  lineHeight?: any;
  hidePatientDetails?: any;
  onlyPreviewWatermark?: any;
  isVerifyEmail?: any;
  htmlPreview?: any;
  printTextWaterMark?: any;
  previewWatermarkObject?: any;
  orientationNotSet?: any;
  footerNotFixedForceFully?: any;
  printTemplateDesign?: any;
}

export const ReportPrintMapper = forwardRef<any, any>((props, ref) => {
  const {
    table_data,
    headerImage,
    footerImage,
    watermark,
    data,
    signatures,
    pageBreakRule = "0",
    lineHeight = false,
    onlyPreviewWatermark,
    isVerifyEmail,
    htmlPreview,
    printTextWaterMark,
    previewWatermarkObject,
    orientationNotSet,
    footerNotFixedForceFully,
    printTemplateDesign
  } = props;

  const templates = printTemplateDesign;
  const getRules: any[] = [];
  const pages = getPages(table_data, signatures, pageBreakRule);
  const isTitleDescHorizontal = getRules?.some(
    (row: any) => row?.key === "title_desc_vertical" && row?.value === "0"
  );

  const departmentTypeDirect = pages?.[0]?.[0]?.department_type ?? null;
  const templateDirect = findTemplateForDepartmentType(
    templates,
    departmentTypeDirect,
  );

  const config = templateDirect?.editor_config ?? null;

  return (
    <div className={htmlPreview ? "" : "hidden"}>
      <div ref={ref} className="report-container">

        {config?.page_size === "A5" && !orientationNotSet ? (
          <style>{`
            @media print {
              @page {
                size: A5 ${config?.orientation?.toLowerCase()};
                margin: 0.22cm;
              }
            }
            @page {
              @bottom-right {
                content: "Page: " counter(page) " of " counter(pages);
                font-size: 8px;
                padding-right:10px;
                color: #000000;
              }
            }
          `}</style>
        ) : (
          config?.page_size === "A4" &&
          !orientationNotSet && (
            <style>{`
              @page {
                size: A4;
                margin: ${config?.margin.top ?? 5}px ${config?.margin.right ?? 5}px ${config?.margin.bottom ?? 5}px ${config?.margin.left ?? 5}px;
                @bottom-right {
                  content: "Page: " counter(page) " of " counter(pages);
                  font-size: 14px;
                  padding-right:15px;
                  color: #000000;
                }
              }
            `}</style>
          )
        )}

        {pages?.length === 0 && "Nothing to Print"}

        {pages?.map((page: any, index: number) => {
          const departmentType = page[0].department_type;
          const agent_name = page[0].agent_name;
          const departmentName = page[0].department_name;
          const labId = page[0]?.lab_id;
          const patientTestId = page[0]?.id;

          const template = findTemplateForDepartmentType(
            templates,
            departmentType,
          );

          if (!template) {
            return (
              <div style={{ pageBreakAfter: "always" }}>
                {departmentType} Template Not Found
              </div>
            );
          }

          const templateConfig = template.editor_config;

          const mappingSource = {
            ...data,
            total_count: pages?.length,
            page_number: index + 1,
            ...page?.[0],
            patient: {
              ...data,
              agent_name,
            },
            signatures:
              signatures && signatures?.[labId]?.[patientTestId]
                ? Object.values(signatures[labId][patientTestId]).flat()
                : null,
            referral_doctor:
              page?.[0].agent_doctor || page?.[0].referral_doctor,
          };

          const headerBlocks = template.content_blocks
            .filter((block: any) => block.isVisible && block.location === "header")
            .map((block: any) => mapValueToBlock(block, mappingSource));

          const contentBlock = template.content_blocks
            .filter((item: any) => item.isVisible)
            .find((item: any) => item.location === "content");

          const footerBlocks = template.content_blocks
            .filter((item: any) => item.isVisible && item.location === "footer")
            .map((block: any) => mapValueToBlock(block, mappingSource));

          if (!contentBlock) {
            return (
              <div style={{ marginTop: headerImage?.height ?? 0 }}>
                You forgot to add content in the template
              </div>
            );
          }

          const lastPageRenderBlockFooter = footerBlocks?.filter(
            (row: any) => row?.frontendConditionValue === "last_page_render"
          );

          return (
            <div style={{ pageBreakAfter: pages.length !== index + 1 ? "always" : "auto" }}>
              <PageRender
                footerNotFixedForceFully={footerNotFixedForceFully}
                previewWatermarkObject={previewWatermarkObject}
                printTextWaterMark={printTextWaterMark}
                isVerifyEmail={isVerifyEmail}
                onlyPreviewWatermark={onlyPreviewWatermark}
                key={index}
                config={templateConfig}
                headerImage={headerImage}
                footerImage={footerImage}
                watermark={watermark}
                headerBlocks={headerBlocks}
                footerBlocks={footerBlocks?.filter(
                  (row: any) => row?.frontendConditionValue !== "last_page_render"
                )}
                contentX={contentBlock.x}
                contentY={contentBlock.y}
                totalPages={pages.length}
                contentBlock={
                  departmentType === "PATHO" ? (
                    <PathoContentBlock
                      blockProps={{
                        ...(contentBlock as any),
                        title: departmentName,
                        data: getTableContent(page, pageBreakRule),
                      }}
                      lastPageContent={
                        pages.length === index + 1 ? lastPageRenderBlockFooter : null
                      }
                      lineHeight={lineHeight}
                      isFooterFixed={templateConfig?.printPreference?.isFooterFixed}
                      maxWidth={templateConfig.width}
                      onlyPreviewWatermark={onlyPreviewWatermark}
                    />
                  ) : (
                    <HistoContentBlock
                      blockProps={{
                        ...(contentBlock as any),
                        ...getDescriptionContent(page),
                      }}
                      footerImage={footerImage}
                      footerBlocks={footerBlocks?.filter(
                        (row: any) => row?.frontendConditionValue !== "last_page_render"
                      )}
                      config={templateConfig}
                      printPreference={templateConfig?.printPreference}
                      lastPageContent={
                        pages.length === index + 1 ? lastPageRenderBlockFooter : null
                      }
                      isTitleDescHorizontal={isTitleDescHorizontal}
                      maxWidth={templateConfig.width}
                    />
                  )
                }
              />
            </div>
          );
        })}
      </div>
    </div>
  );
});
