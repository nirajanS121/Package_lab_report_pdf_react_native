import { PDFDocument, StandardFonts } from "pdf-lib";
import {
  findTemplateForDepartmentType,
  getPages,
  mapValueToBlock,
} from "../helper";
import { getTableContent } from "../ReportPrintMapper/helper";
import type { PrintMapperProps } from "../ReportPrintMapper";
import { createPdfContext } from "./blocks";
import { PageManager } from "./pageManager";
import { drawPathoTable } from "./pathoTable";

export async function renderReportPdf(
  props: PrintMapperProps,
): Promise<Uint8Array> {
  const {
    table_data,
    headerImage,
    footerImage,
    watermark,
    data,
    signatures,
    pageBreakRule = "0",
    printTemplateDesign,
    hideHeader,
    hideFooter,
  } = props;

  const templates = printTemplateDesign;
  const pages = getPages(table_data, signatures, pageBreakRule);

  const pdfDoc = await PDFDocument.create();
  const ctx = createPdfContext(pdfDoc, {
    regular: await pdfDoc.embedFont(StandardFonts.Helvetica),
    bold: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
    italic: await pdfDoc.embedFont(StandardFonts.HelveticaOblique),
    boldItalic: await pdfDoc.embedFont(StandardFonts.HelveticaBoldOblique),
  });

  if (pages.length === 0) {
    const page = pdfDoc.addPage([595, 842]);
    page.drawText("Nothing to Print", {
      x: 40,
      y: 800,
      size: 14,
      font: ctx.fonts.regular,
    });
    return pdfDoc.save();
  }

  for (let index = 0; index < pages.length; index++) {
    const page = pages[index];
    const departmentType = page[0].department_type;
    const departmentName = page[0].department_name;
    const agentName = page[0].agent_name;
    const labId = page[0]?.lab_id;
    const patientTestId = page[0]?.id;

    const template = findTemplateForDepartmentType(templates, departmentType);
    if (!template) {
      const pdfPage = pdfDoc.addPage([595, 842]);
      pdfPage.drawText(`${departmentType} Template Not Found`, {
        x: 40,
        y: 800,
        size: 14,
        font: ctx.fonts.regular,
      });
      continue;
    }

    const templateConfig = template.editor_config;
    const mappingSource = {
      ...data,
      total_count: pages.length,
      page_number: index + 1,
      ...page?.[0],
      patient: { ...data, agent_name: agentName },
      signatures:
        signatures && signatures?.[labId]?.[patientTestId]
          ? Object.values(signatures[labId][patientTestId]).flat()
          : null,
      referral_doctor: page?.[0].agent_doctor || page?.[0].referral_doctor,
    };

    const headerBlocks = template.content_blocks
      .filter((block: any) => block.isVisible && block.location === "header")
      .map((block: any) => mapValueToBlock(block, mappingSource));

    const contentBlock = template.content_blocks
      .filter((item: any) => item.isVisible)
      .find((item: any) => item.location === "content");

    const footerBlocks = template.content_blocks
      .filter((item: any) => item.isVisible && item.location === "footer")
      .map((block: any) => mapValueToBlock(block, mappingSource))
      .filter((row: any) => row?.frontendConditionValue !== "last_page_render");

    if (!contentBlock) continue;

    const pageManager = new PageManager(pdfDoc, ctx, {
      config: templateConfig,
      headerImage,
      footerImage,
      watermark,
      headerBlocks,
      footerBlocks,
      hideHeader,
      hideFooter,
    });
    await pageManager.start();

    if (departmentType === "PATHO") {
      await drawPathoTable(pageManager, ctx, {
        title: departmentName,
        data: getTableContent(page, pageBreakRule),
        tableColumns: contentBlock.tableColumns,
        tableWidth: contentBlock.tableWidth,
        endNoteConfig: contentBlock.endNoteConfig,
        commentsConfig: contentBlock.commentsConfig,
        x: contentBlock.x,
      });
    } else {
      pageManager.page.drawText(
        `${departmentType} report type not yet supported by the PDF renderer`,
        {
          x: contentBlock.x,
          y: pageManager.pageHeight - pageManager.contentTop - 20,
          size: 12,
          font: ctx.fonts.regular,
        },
      );
    }
  }

  return pdfDoc.save();
}
