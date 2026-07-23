import { isBarcodeBlock } from "./basic-blocks/barcode/utils";
import { isImageBlock } from "./basic-blocks/image/utils";
import { isQrcodeBlock } from "./basic-blocks/qrcode/utils";
import { isSignatureBlock } from "./basic-blocks/signature/utils";
import { isValueBlock } from "./basic-blocks/value/utils";

export function findTemplateForDepartmentType(
  templates: any[] | undefined,
  departmentType: any,
): any {
  return templates?.find((t: any) => {
    let arr: any[];
    if (Array.isArray(t.dep_type)) {
      arr = t.dep_type;
    } else {
      try {
        const parsed = JSON.parse(t.dep_type);
        arr = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        arr = [t.dep_type];
      }
    }
    return arr.includes(departmentType);
  });
}

export function getValue(obj: Record<string, any>, path?: any): any {
  if (!obj || !path) return undefined;
  if (Array.isArray(path)) {
    return path.reduce((acc, cur) => acc?.[cur], obj);
  }
  return path.split(".").reduce((acc: any, key: any) => acc?.[key], obj);
}

export const mapValueToBlock = (
  block: any,
  values?: Record<string, any>,
  getCurrentFooterSign?: any,
): any => {
  if (isValueBlock(block) || isBarcodeBlock(block) || isQrcodeBlock(block)) {
    return {
      ...block,
      value: values ? getValue(values, block.mappingKey) : block.value,
    };
  }
  if (isImageBlock(block)) {
    return {
      ...block,
      url: values ? getValue(values, block.mappingKey) : block.url,
    };
  }
  if (isSignatureBlock(block)) {
    const signatureData = values?.signatures?.find(
      (signature: any) => signature.position === block.mappingKey,
    );
    if (signatureData) {
      const {
        nmc,
        nhpc_no,
        caption,
        user_name,
        signature,
        specialities,
        qualification,
        designation,
        hide_signature = false,
      } = signatureData;
      const blockWithData = {
        ...block,
        nmc,
        nhpc_no,
        caption,
        name: user_name,
        specialization: specialities,
        specialities,
        qualification,
        imageUrl: signature,
        label: "",
        hide_signature,
        designation,
        getCurrentFooterSign,
      };
      return blockWithData;
    }
    return { ...block, isVisible: false };
  }
  return block;
};

export const mapValueToBlocks = (
  blocks: Array<any>,
  values: { [key: string]: any },
): Array<any> => {
  const updatedBlocks = blocks?.map((block) => mapValueToBlock(block, values));

  return updatedBlocks;
};

export function getPages(
  data: Array<any> | undefined,
  signatures: any,
  pageBreakRule?: string,
): any[][] {
  if (!data) return [];

  const pageMap: Record<string, any[]> = data.reduce(
    (acc, item, index) => {
      const departmentId = item?.department_id;

      const signatureKey =
        signatures?.[departmentId]?.reduce(
          (sum: string, sig: any) => sum + (sig?.user_name || ""),
          "",
        ) || "";

      const isPatho = item.department_type === "PATHO";

      let key = "";

      if (item.separate_page) {
        key = `separate-${item.lab_id}-${item.name}-${index}`;
      } else if (pageBreakRule === "0") {
        key = `${item.lab_id}-${signatureKey}`;
      } else {
        key = isPatho
          ? `${item.lab_id}-${item.department_name}`
          : `${item.lab_id}-${item.name}`;
      }

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

export function groupByProfile(items: any[]): Record<string, any[]> {
  return items.reduce((acc: Record<string, any[]>, item: any) => {
    if (item.profile && item.profile.name) {
      const key = item.profile.name;

      if (!acc[key]) {
        acc[key] = [];
      }

      acc[key].push(item);
    } else {
      const key = "-1";

      if (!acc[key]) {
        acc[key] = [];
      }

      acc[key].push(item);
    }

    return acc;
  }, {});
}

export interface IAntibiotic {
  name: string;
  antibiotic_level: "S" | "R" | "I";
}

export const groupAntibiotics = (data: Array<IAntibiotic>) => {
  const sensitive: Array<IAntibiotic> = [];
  const resistant: Array<IAntibiotic> = [];
  const partiallyResistant: Array<IAntibiotic> = [];

  data.forEach((item) => {
    switch (item.antibiotic_level) {
      case "S":
        sensitive.push(item);
        break;
      case "R":
        resistant.push(item);
        break;
      case "I":
        partiallyResistant.push(item);
        break;
    }
  });

  return { sensitive, resistant, partiallyResistant };
};
