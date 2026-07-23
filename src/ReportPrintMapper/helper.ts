import { groupByProfile } from "../helper";

export function getPages(data: Array<any>): any[][] {
  const pageMap: Record<string, any[]> = data.reduce(
    (acc, item) => {
      const key = item.separate_page ? item?.name : item?.department_name;

      if (!acc[key]) {
        acc[key] = [];
      }

      acc[key].push(item);
      return acc;
    },
    {} as Record<string, any[]>,
  );

  return Object.values(pageMap);
}

export const getTableContent = (page: any, pageBreakRule: string) => {
  const tableProfiles: any[] = [];

  const group = groupByProfile(page);

  Object.entries(group).forEach(([profileName, items]) => {
    const tableRows: Array<any> = [];

    items.forEach((item, index) => {
      const { patient_test_details, patient_pre_footer } = item;

      let level = profileName !== "-1" ? 1 : 0;

      const previousDepartmentName =
        index > 0 ? items[index - 1]?.department_name?.toLowerCase() : null;

      const isAddDepartmentHeading =
        index !== 0 &&
        item?.department_name?.toLowerCase() !== previousDepartmentName &&
        pageBreakRule === "0";

      if (isAddDepartmentHeading) {
        tableRows.push({
          title: item?.department_name,
          type: "department_heading",
          level: 0,
          hideUnitRef: false,
        });
      }

      let headingLevel = 0;
      patient_test_details.forEach((testDetail, index) => {
        if (testDetail.result_type === "heading") {
          const heading_row: any = {
            type: "heading",
            level: level,
            title: testDetail.parameter_name,
            hideUnitRef: testDetail.hideUnitRef,
          };
          if (headingLevel < 1) level = level + 1;
          headingLevel += 1;
          tableRows.push(heading_row);
        } else {
          const data_row: any = {
            type: "data",
            test: testDetail.parameter_name,
            result: testDetail.finding,
            showFlag: testDetail.show_flag,
            hideUnitRef: testDetail.hide_unit_ref,
            flag: testDetail.flag,
            unit: testDetail.uom_name,
            referenceRange: testDetail.display_range,
            endnote:
              patient_test_details.length - 1 === index
                ? (patient_pre_footer?.endnote ?? undefined)
                : undefined,
            comment:
              patient_test_details.length - 1 === index
                ? (patient_pre_footer?.comment ?? undefined)
                : undefined,
            abnormal: testDetail?.abnormal,
            display_nameEndnote: patient_pre_footer?.display_name,
            level: headingLevel > 1 ? level + 1 : level,
            method: testDetail.method_name,
            specimen_name: testDetail.specimen_name,
            antibiotic_results: testDetail.antibiotic_results,
            result_type: testDetail.result_type,
            freetext_range: testDetail.freetext_range,
            finding_posted_user_name: item?.finding_posted_user_name,
            verified_user_name: item?.verified_user_name,
          };
          tableRows.push(data_row);
        }
      });
    });

    const profileData: any = {
      title: profileName === "-1" ? undefined : profileName,
      data: tableRows,
      department_name:
        pageBreakRule === "0" ? items?.[0]?.department_name : null,
      remarks: items[0].profile_remarks,
    };
    tableProfiles.push(profileData);
  });
  return tableProfiles;
};

export const getDescriptionContent = (page: any) => {
  const tableRows: Array<{ title: string; description: string }> = [];

  const {
    patient_template_detail,
    patient_template_content,
    is_finding_template_content,
  } = page[0];
  const source = is_finding_template_content
    ? patient_template_content
    : patient_template_detail;

  const reportTitle = source?.[0]?.report_title;
  const subTitle = source?.[0]?.report_sub_title;

  source?.forEach((detail: any) =>
    tableRows.push({
      title: detail.title_name,
      description: detail.finding,
    }),
  );

  return { data: tableRows, title: reportTitle, subtitle: subTitle };
};
