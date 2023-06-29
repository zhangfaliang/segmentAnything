import React, { useEffect, useRef } from "react";
import Cropper from "cropperjs";
import { cleanImageProps } from "./utils";

const REQUIRED_IMAGE_STYLES = { opacity: 0, maxWidth: "100%" };

interface ReactCropperDefaultOptions {
  scaleX?: number;
  scaleY?: number;
  enable?: boolean;
  zoomTo?: number;
  rotateTo?: number;
}

interface ReactCropperProps
  extends ReactCropperDefaultOptions,
    Cropper.Options<HTMLImageElement>,
    Omit<React.HTMLProps<HTMLImageElement>, "data" | "ref" | "crossOrigin"> {
  crossOrigin?: "" | "anonymous" | "use-credentials" | undefined;
  on?: (
    eventName: string,
    callback: () => void | Promise<void>
  ) => void | Promise<void>;
  onInitialized?: (instance: Cropper) => void | Promise<void>;
}

const applyDefaultOptions = (
  cropper: Cropper,
  options: ReactCropperDefaultOptions = {}
): void => {
  const {
    enable = true,
    scaleX = 1,
    scaleY = 1,
    zoomTo = 0,
    rotateTo,
  } = options;
  enable ? cropper.enable() : cropper.disable();
  cropper.scaleX(scaleX);
  cropper.scaleY(scaleY);
  rotateTo !== undefined && cropper.rotateTo(rotateTo);
  zoomTo > 0 && cropper.zoomTo(zoomTo);
};

/**
 * sourced from: https://itnext.io/reusing-the-ref-from-forwardref-with-react-hooks-4ce9df693dd
 */

const ReactCropper = ({ ...props }) => {
  const {
    dragMode = "crop",
    src,
    style,
    className,
    crossOrigin,
    scaleX,
    scaleY,
    enable,
    zoomTo,
    rotateTo,
    alt = "picture",
    ready,
    onInitialized,
    cropper,
    setCropper,
    ...rest
  } = props;
  const defaultOptions: ReactCropperDefaultOptions = {
    scaleY,
    scaleX,
    enable,
    zoomTo,
    rotateTo,
  };
  /**
   * Invoke zoomTo method when cropper is set and zoomTo prop changes
   */
  useEffect(() => {
    if (cropper && typeof zoomTo === "number") {
      cropper.zoomTo(zoomTo);
    }
  }, [props.zoomTo]);

  /**
   * re-render when src changes
   */
  useEffect(() => {
    if (cropper && typeof src !== "undefined") {
      cropper.reset().clear().replace(src);
    }
  }, [src]);

  useEffect(() => {
    const ele: any = document.querySelector("#corp_img_component");
    if (ele) {
      const cropper = new Cropper(ele, {
        dragMode,
        ...rest,
        ready: (e) => {
          if (e.currentTarget !== null) {
            // applyDefaultOptions(e.currentTarget.cropper, defaultOptions);
          }
          ready && ready(e);
        },
      });
      onInitialized && onInitialized(cropper);
      setCropper(cropper);
    }

    return () => {
      const ele: any = document.querySelector("#corp_img_component");
      ele?.cropper?.destroy();
    };
  }, []);

  const imageProps = cleanImageProps({ ...rest, crossOrigin, src, alt });

  return (
    <div style={style} className={className}>
      <img
        id="corp_img_component"
        {...imageProps}
        style={REQUIRED_IMAGE_STYLES}
      />
    </div>
  );
};

export default ReactCropper;
