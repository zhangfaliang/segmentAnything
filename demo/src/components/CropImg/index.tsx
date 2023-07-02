import React, { useState, useContext, useRef, useEffect } from "react";

import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  Crop,
  PixelCrop,
} from "react-image-crop";
import AppContext from "../hooks/createContext";
import { canvasPreview } from "./canvasPreview";
import { useDebounceEffect } from "./useDebounceEffect";
import "./index.scss";
import { uploadData } from "../../../request/index";
import { handleImageScale } from "../../components/helpers/scaleHelper";
import Button from "@mui/material/Button";
import AddTaskIcon from "@mui/icons-material/AddTask";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

const CropImg = ({ handleMouseMove, uploadURL = "/save_image" }: any) => {
  const [imgSrc, setImgSrc] = useState("");
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const hiddenAnchorRef = useRef<HTMLAnchorElement>(null);
  const blobUrlRef = useRef("");
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [aspect, setAspect] = useState<number | undefined>(16 / 9);
  const [crop, setCrop] = useState<Crop>();
  const [cropWidth, setCropWidth] = useState(0);
  const [cropHeight, setCropHeight] = useState(0);

  const {
    image: [image, setImage],
    maskImg: [maskImg, setMaskImg],
    processImgType: [processImgType, setProcessImgType],
    loading: [loading, setLoading],
    previousMask: [, setPreviousMask],
    mergedMask: [, setMergedMask],
    globalLoadFile: [globalLoadFile],
    maskImgList: [maskImgList, setMaskImgList],
    showMaskImgList: [, setShowMaskImgList],
  } = useContext(AppContext)!;

  function onSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined); // Makes crop preview update between images.
      const reader = new FileReader();
      reader.addEventListener("load", () =>
        setImgSrc(reader.result?.toString() || "")
      );
      reader.readAsDataURL(e.target.files[0]);
    }
  }

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    if (aspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspect));
    }
  }

  async function onDownloadCropClick() {
    if (!previewCanvasRef.current) {
      throw new Error("Crop canvas does not exist");
    }
    setLoading(true);
    setMaskImg(null);
    setPreviousMask("");
    setMergedMask("");
    setProcessImgType("mask");

    const imgUrl: any = image?.src; // 获取图像的 URL
    const imgFileName = imgUrl?.substring(imgUrl?.lastIndexOf("/") + 1);
    const base64data: any = previewCanvasRef.current.toDataURL("image/png");
    const newImg = new Image();
    const byteCharacters = atob(base64data?.split(",")[1]);
    const byteArrays = [];
    for (let i = 0; i < byteCharacters.length; i++) {
      byteArrays.push(byteCharacters.charCodeAt(i));
    }
    const blob = new Blob([new Uint8Array(byteArrays)], { type: "image/png" });
    const imgFileSizeInBytes = blob.size;
    const { data, code, message } =
      (await uploadData({
        url: uploadURL,
        data: {
          imgData: base64data.replace(
            /data:image\/(jpeg|png|jpg|gif);base64,/,
            ""
          ),
          imgName: imgFileName, //file.name,
          size: imgFileSizeInBytes,
        },
      })) || {};

    newImg.src = base64data;
    newImg.onload = () => {
      const { height, width, samScale } = handleImageScale(newImg);
      newImg.width = width;
      newImg.height = height;
      setImage(newImg);
    };
    const { imgURL, npyURL, onnxURL } = data;
    const url = new URL(imgURL, location.origin);
    globalLoadFile({ imgURL: url, npyURL, onnxURL, data });
  }

  useDebounceEffect(
    async () => {
      if (
        completedCrop?.width &&
        completedCrop?.height &&
        imgRef.current &&
        previewCanvasRef.current
      ) {
        // We use canvasPreview as it's much faster than imgPreview.
        canvasPreview(
          imgRef.current,
          previewCanvasRef.current,
          completedCrop,
          scale,
          rotate
        );
      }
    },
    100,
    [completedCrop, scale, rotate]
  );

  useEffect(() => {
    setAspect(undefined);
  }, []);

  const handleOperate = ({ type }: any) => {
    const parentEle: any = document.getElementById("useImgWrapper");
    const maskPointers: any = document.querySelectorAll(".maskPointer");
    if (parentEle && maskPointers) {
      maskPointers.forEach((maskPointer: any) => {
        parentEle.removeChild(maskPointer);
      });
    }
    setMaskImg(null);
    setPreviousMask("");
    setMergedMask("");
    setProcessImgType(type);
  };
  const handleHeightInputChange = (e: any) => {
    const value = e.target.value;
    setCropHeight(value);
  };
  const handleWidthInputChange = (e: any) => {
    const value = e.target.value;
    setCropWidth(value);
  };
  const maskImageClasses = `absolute opacity-40 pointer-events-none`;
  const addCutOutObject = () => {
    setMaskImgList([...maskImgList, maskImg?.src]);
    setShowMaskImgList(true);
  };
  return (
    image && (
      <div className="use_img_operate_wrapper">
        <div className="crop_btn_group_wrapper">
          <Button variant="contained" onClick={addCutOutObject}>
            <PlaylistAddIcon />
            添加到mask列表
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              handleOperate({ type: "getImg" });
            }}
          >
            <AddTaskIcon
              style={{
                marginRight: "5px",
              }}
            />{" "}
            获取白底图片
          </Button>
        </div>
        <div>
          {processImgType === "crop" && (
            <ReactCrop
              disabled={processImgType !== "crop"}
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspect}
            >
              <img
                ref={imgRef}
                alt="Crop me"
                style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
                src={image.src}
                className={`target_img`}
                id="use_image"
              ></img>
            </ReactCrop>
          )}
          {processImgType !== "crop" && (
            <div className="use_img_mask_wrapper">
              <img
                ref={imgRef}
                alt="Crop me"
                style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
                onLoad={onImageLoad}
                onClick={(e: any) => {
                  processImgType === "mask" && handleMouseMove(e);
                }}
                onContextMenu={(event) => {
                  if (processImgType !== "mask") return;
                  event.preventDefault();
                  handleMouseMove({ ...event, clickType: "right" });
                }}
                src={image.src}
                className={`target_img`}
                id="use_image"
              ></img>
              {maskImg && (
                <img
                  src={maskImg.src}
                  className={`${maskImageClasses} target_img use_img_mask`}
                ></img>
              )}
            </div>
          )}
          {image && processImgType === "getImg" && (
            <a className="down_img_btn" href={image.src} download>
              {" "}
              下载白底图片(可用于webui img2img)
            </a>
          )}

          {!!completedCrop && processImgType === "crop" && (
            <>
              <div>
                <canvas
                  ref={previewCanvasRef}
                  style={{
                    border: "1px solid black",
                    objectFit: "contain",
                    width: completedCrop.width,
                    height: completedCrop.height,
                    position: "absolute",
                    top: "-200vh",
                    visibility: "hidden",
                  }}
                />
              </div>
            </>
          )}
        </div>
        <div className="use_img_operate">
          <span
            className={processImgType === "mask" ? "btn active" : "btn"}
            onClick={() => {
              handleOperate({ type: "mask" });
            }}
          >
            获取mask
          </span>
          <span
            onClick={() => {
              handleOperate({ type: "crop" });
            }}
            className={processImgType === "crop" ? "btn active" : "btn"}
          >
            裁剪
          </span>
          {processImgType === "crop" && (
            <div className="crop_inner_btn_content">
              {/* <label className="crop_inner_label" htmlFor="height">
                <input
                  className="crop_inner_label_input"
                  placeholder="height"
                  name="height"
                  type="number"
                  onChange={handleHeightInputChange}
                />
              </label>
              <label className="crop_inner_label" htmlFor="width">
                <input
                  className="crop_inner_label_input"
                  placeholder="width"
                  name="width"
                  type="number"
                  onChange={handleWidthInputChange}
                />
              </label> */}
              <span
                onClick={onDownloadCropClick}
                className={processImgType === "crop" ? "btn active" : "btn"}
              >
                使用裁剪图片
              </span>

              <a
                ref={hiddenAnchorRef}
                download
                style={{
                  position: "absolute",
                  top: "-200vh",
                  visibility: "hidden",
                }}
              ></a>
            </div>
          )}

          <span
            onClick={() => {
              handleOperate({ type: "getImg" });
            }}
            className={processImgType === "getImg" ? "btn active" : "btn"}
          >
            获取白底图片
          </span>
        </div>
      </div>
    )
  );
};

export default CropImg;
