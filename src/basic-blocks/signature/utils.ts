import { BlockProps, IBlockLocation } from "../../content-blocks/type";
import { SignatureBlockProps } from "./type";

interface Props {
  key: string;
  label: string;
  mappingKey: string;
  location: IBlockLocation;
}

export const createSignatureBlock = (props: Props): SignatureBlockProps => {
  const signatureBlock: SignatureBlockProps = {
    type: "signature",
    isVisible: false,
    x: 0,
    y: 0,
    maxHeight: 50,
    maxWidth: 100,
    caption: "Received/ Verified By",
    name: "Name",
    qualification: "Qualification",
    specialization: "Specialization",
    specialities:"specialities",
    nmc: "nmc",
    nhpc_no: "nhpc_no",
    ...props,
  };

  return signatureBlock;
};

export function isSignatureBlock(block: BlockProps): block is SignatureBlockProps {
  return block.type === "signature";
}
