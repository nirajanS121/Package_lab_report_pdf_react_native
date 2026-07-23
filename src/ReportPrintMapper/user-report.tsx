import { forwardRef } from "react";
import { getDescriptionContent, getTableContent } from "./helper";
import { PageRender } from "../page-render";
import { getPages, mapValueToBlock } from "../helper";
import { PathoContentBlock } from "../content-blocks/patho";
import { HistoContentBlock } from "../content-blocks/histo";

interface UserPrintMapperProps {
  data: {
    headerImage?: any;
    footerImage?: any;
    watermark?: any;

    data?: { [key: string]: any };
    table_data?: Array<any>;
    signatures?: { [key: string]: Array<any> };

    report_template?: Array<any>;
  };
}

export const UserReportPrintMapper = forwardRef<HTMLDivElement, UserPrintMapperProps>((props, ref) => {
  const { table_data, headerImage, footerImage, watermark, data, signatures, report_template } = props.data;
  const pages = getPages(table_data, signatures);

  return (
    <div>
      <div ref={ref}>
        {pages?.length === 0 && "Nothing to Print"}
        {pages?.map((page, index) => {
          const departmentType = page[0].department_type;
          const departmentName = page[0].department_name;
          const departmentId = page[0].department_id;

          const template = report_template?.find((template) => template.dep_type.includes(departmentType));
          const imagesAfterContent = page[0].patient_test_documents?.map((item) => item.file_path) ?? [];

          if (!template) {
            return (
              <div style={{ pageBreakAfter: "always", marginTop: headerImage?.height ?? 0 }}>
                {departmentType} Template Not Found
              </div>
            );
          }
          const templateConfig = template.editor_config;
          const mappingSource = {
            ...data,
            ...page?.[0],
            signatures: signatures?.[departmentId],
            referral_doctor:
              page?.[0].agent_doctor || page?.[0].referral_doctor,
          };

          const headerBlocks = template.content_blocks
            .filter((block) => block.isVisible && block.location === "header")
            .map((block) => mapValueToBlock(block, mappingSource));

          const contentBlock = template.content_blocks
            .filter((item) => item.isVisible)
            .find((item) => item.location === "content");

          const footerBlocks = template.content_blocks
            .filter((item) => item.isVisible && item.location === "footer")
            .map((block) => mapValueToBlock(block, mappingSource));

          if (!contentBlock) {
            return (
              <div style={{ marginTop: headerImage?.height ?? 0 }}>
                You forgot to add content in the template
              </div>
            );
          }
          return (
            <div className="border border-black shadow-lg bg-white mb-[10px]">
              <PageRender
                key={index}
                config={templateConfig}
                headerImage={headerImage}
                footerImage={footerImage}
                watermark={watermark}
                headerBlocks={headerBlocks}
                footerBlocks={footerBlocks}
                contentX={contentBlock.x}
                contentY={contentBlock.y}
                totalPages={pages.length}
                contentBlock={
                  departmentType === "PATHO" ? (
                    <PathoContentBlock
                      blockProps={{
                        ...(contentBlock as any),
                        title: departmentName,
                        data: getTableContent(page, "1"),
                      }}
                      maxWidth={templateConfig.width - templateConfig.margin.left - templateConfig.margin.right}
                    />
                  ) : (
                    <HistoContentBlock
                      blockProps={{
                        ...(contentBlock as any),
                        ...getDescriptionContent(page),
                      }}
                      maxWidth={templateConfig.width - templateConfig.margin.left - templateConfig.margin.right}
                    />
                  )
                }
                suffix={
                  imagesAfterContent.length > 0 ? (
                    <div
                      className="grid gap-2 my-2"
                      style={{
                        marginLeft: templateConfig.margin.left,
                        marginRight: templateConfig.margin.right,
                        maxWidth: templateConfig.width - templateConfig.margin.right - templateConfig.margin.left,
                        gridTemplateColumns: "repeat(2, 1fr)",
                      }}
                    >
                      {imagesAfterContent.map((image, imageIndex) => (
                        <div key={`${image.name}-${imageIndex}`}>
                          <img
                            src={image.name}
                            alt=""
                            style={{
                              width: "100%",
                              maxHeight: templateConfig.height * 0.15,
                              objectFit: "contain",
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  ) : null
                }
              />
            </div>
          );
        })}
      </div>
    </div>
  );
});
