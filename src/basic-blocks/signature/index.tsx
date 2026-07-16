import { SignatureBlockProps } from "./type";

interface Props {
  blockProps: SignatureBlockProps;
  scaleFactor?: number;
}

export const SignatureBlock: React.FC<Props> = ({ blockProps, scaleFactor = 1 }) => {
  const { maxHeight, maxWidth, label, imageUrl, mappingKey } = blockProps;
  const {
    caption,
    name,
    qualification,
    specialization,
    designation,
    nmc,
    nhpc_no,
    frontendConditionValue = "",
  } = blockProps;
  console.log(label,"labellabellabellabel")
  const scaledHeight = maxHeight * scaleFactor;
  const scaledWidth = maxWidth * scaleFactor;
  const isImage = typeof imageUrl === "string";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: "1px",
      }}
    >
      {
        //@ts-ignore
        imageUrl && !blockProps?.hide_signature ? (
          <div
            style={{
              height: scaledHeight,
              width: scaledWidth,
              overflow: "hidden",
            }}
          >
            {isImage ? (
              <img
                src={imageUrl}
                alt={`signature-${mappingKey}`}
                style={{
                  height: "100%",
                  width: "100%",
                  objectFit: "contain",
                }}
              />
            ) : (
              ""
            )}
          </div>
        ) : (
          <div
            style={{
              height: scaledHeight,
              width: scaledWidth,
              fontSize: `${10 * scaleFactor}px`,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
              flexDirection: "column",
              whiteSpace: "normal",
              wordWrap: "break-word",
            }}
          >
            {label}
          </div>
        )
      }

      {
        //@ts-ignore
        !frontendConditionValue && imageUrl && !blockProps?.hide_signature && (
          <div
            style={{
              height: 5 * scaleFactor,
              width: 100 * scaleFactor,
              borderBottom: "1px dashed #000",
            }}
          />
        )
      }
      {caption && <div style={{ fontSize: `${11 * scaleFactor}px`, fontWeight: 600 }}>{caption}</div>}
      {name && <div style={{ fontSize: `${11 * scaleFactor}px`, fontWeight: 600 }}>{name}</div>}
      {qualification && <div style={{ fontSize: `${11 * scaleFactor}px`, fontWeight: 600 }}>{qualification}</div>}
      {specialization && <div style={{ fontSize: `${11 * scaleFactor}px`, fontWeight: 600 }}>{specialization}</div>}
      {designation && <div style={{ fontSize: `${11 * scaleFactor}px`, fontWeight: 600 }}>{designation}</div>}
      {nmc && <div style={{ fontSize: `${11 * scaleFactor}px`, fontWeight: 600 }}>NMC No. {nmc}</div>}
      {/* {qualification && <div style={{ fontSize: `${11 * scaleFactor}px`, fontWeight: 600 }}>{qualification}</div>} */}
      {/* {specialities && (
        <div style={{ fontSize: `${11 * scaleFactor}px`, fontWeight: 600 }}>{ specialities}</div>
      )} */}
      {nhpc_no && <div style={{ fontSize: `${11 * scaleFactor}px`, fontWeight: 600 }}>NHPC No. {nhpc_no}</div>}
    </div>
  );
};
