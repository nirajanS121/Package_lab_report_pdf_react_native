import { ImageBlockProps } from "./type";

interface Props {
  blockProps: ImageBlockProps;
  scaleFactor?: number;
  logoImage?: any;
}

export const ImageBlock: React.FC<Props> = (props) => {
  const { blockProps, scaleFactor = 1, logoImage } = props;
  const { url, label, height, width } = blockProps;

  return (
    <div
      style={{
        width: `${width * scaleFactor}px`,
        height: `${height * scaleFactor}px`,
      }}
    >
      { logoImage ||url  ? (
        <img
          src={logoImage?.name??url }
          style={{
            width: width * scaleFactor,
            height: height * scaleFactor,
            objectFit: "contain",
          }}
        />
      ) : (
        <div
          className="h-full w-full outline-dashed outline-1 flex items-center justify-center"
          style={{ fontSize: height * 0.25 * scaleFactor }}
        >
          {label}
        </div>
      )}
    </div>
  );
};
