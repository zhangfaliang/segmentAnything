import "./index.scss";
import React, { useState, useContext, CSSProperties, useEffect } from "react";
import FileUpload from "react-material-file-upload";
import "./index.scss";
import { uploadData } from "../../../request/index";
import AppContext from "../hooks/createContext";
import { ToastContainer, toast } from "react-toastify";
import { isArray } from "lodash";
import { handleImageScale } from "../../components/helpers/scaleHelper";
import ImageUploading from "react-images-uploading";
import Button from "@mui/material/Button";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
const maxSize = 5;
const maxNumber = 5;

export default function App({
  loadFile,
  setLoading,
  loading,
  showToImgList = true,
  uploadURL = "/save_image",
}: any) {
  // 压缩前将file转换成img对象
  const readImg = (file: any) => {
    return new Promise((resolve, reject) => {
      const img: any = new Image();
      const reader = new FileReader();
      reader.onload = function (e) {
        img.src = this.result;
      };
      reader.onerror = function (e) {
        reject(e);
      };
      reader.readAsDataURL(file);
      img.onload = function () {
        resolve(img);
      };
      img.onerror = function (e: any) {
        reject(e);
      };
    });
  };
  /**
   * 压缩图片
   *@param img 被压缩的img对象
   * @param type 压缩后转换的文件类型
   * @param mx 触发压缩的图片最大宽度限制
   * @param mh 触发压缩的图片最大高度限制
   */
  const compressImg = (img: any, type: string, mx: number, mh: number) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      const { width: originWidth, height: originHeight } = img;
      // 最大尺寸限制
      const maxWidth = mx;
      const maxHeight = mh;
      // 目标尺寸
      let targetWidth = originWidth;
      let targetHeight = originHeight;
      if (originWidth > maxWidth || originHeight > maxHeight) {
        if (originWidth / originHeight > 1) {
          // 宽图片
          targetWidth = maxWidth;
          targetHeight = Math.round(maxWidth * (originHeight / originWidth));
        } else {
          // 高图片
          targetHeight = maxHeight;
          targetWidth = Math.round(maxHeight * (originWidth / originHeight));
        }
      }
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      context && context.clearRect(0, 0, targetWidth, targetHeight);
      // 图片绘制
      context && context.drawImage(img, 0, 0, targetWidth, targetHeight);
      // canvas.toBlob(function (blob) {
      //   resolve(blob);
      // }, type || "image/png");

      resolve(canvas.toDataURL(type || "image/jpg"));
    });
  };
  const {
    image: [, setImage],
    maskImg: [, setMaskImg],
    previousMask: [, setPreviousMask],
    mergedMask: [, setMergedMask],
    localUpLoadImgData: [localUpLoadImgData, setLocalUpLoadImgData],
  } = useContext(AppContext)!;
  const [images, setImages] = useState<File[]>([]);

  const uploadImg = async ({ imageList }: any) => {
    const { data_url, file }: any = imageList[0];
    if (file.size / 1024 > maxSize * 1024) {
      toast(`🔥--图片不能大于 ${maxSize} MB`, {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
      return;
    }
    if (file) {
      const img = await readImg(file);
      try {
        const base64URL: any = await compressImg(img, file.type, 1000, 1000);
        const newImg = new Image();
        newImg.src = base64URL;
        newImg.onload = () => {
          const { height, width, samScale } = handleImageScale(newImg);
          newImg.width = width;
          newImg.height = height;
          setImage(newImg);
        };
        setMaskImg(null);
        setPreviousMask("");
        setMergedMask("");
      } catch (error) {
        toast(`😂--图片上传出错请再试一次`, {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "light",
        });
      }
    }
    setLocalUpLoadImgData({ data_url, imgName: file.name, size: file.size });
    //       size: file.size, });
    // const { data, code, message } =
    //   (await uploadData({
    //     url: uploadURL,
    //     data: {
    //       imgData: data_url.replace(
    //         /data:image\/(jpeg|png|webp|jpg);base64/,
    //         ""
    //       ),
    //       imgName: file.name, //file.name,
    //       size: file.size,
    //     },
    //   })) || {};

    // if (code === -1) {
    //   toast(`🔐--${message}`, {
    //     position: "top-center",
    //     autoClose: 5000,
    //     hideProgressBar: false,
    //     closeOnClick: true,
    //     pauseOnHover: true,
    //     draggable: true,
    //     theme: "light",
    //   });
    // }
    // const { imgURL, npyURL, onnxURL } = data;
    // const url = new URL(imgURL, location.origin);
    // loadFile({ imgURL: url, npyURL, onnxURL, data });
  };
  const [files, setFiles] = useState<File[]>([]);

  const onChange = (imageList: any) => {
    setImages(imageList);
    if (imageList?.length) {
      uploadImg({ imageList });
    }
  };
  const override: CSSProperties = {
    display: "block",
    margin: "0 auto",
    borderColor: "red",
  };
  const clickToImageList = () => {
    setImage(null);
  };

  return !localUpLoadImgData ? (
    <div className="App">
      <h1>请上传图片</h1>
      <p>支持格式：jpg、png、jpeg、webp</p>
      <ImageUploading
        multiple={false}
        value={images}
        onChange={onChange}
        maxNumber={maxNumber}
        dataURLKey="data_url"
      >
        {({
          imageList,
          onImageUpload,
          onImageRemoveAll,
          onImageUpdate,
          onImageRemove,
          isDragging,
          dragProps,
        }) => (
          <div className="upload__image-wrapper">
            <div
              style={isDragging ? { color: "red" } : undefined}
              onClick={(e: any) => {
                const parentEle: any = document.getElementById("useImgWrapper");
                const maskPointers: any =
                  document.querySelectorAll(".maskPointer");
                if (parentEle && maskPointers) {
                  maskPointers.forEach((maskPointer: any) => {
                    parentEle.removeChild(maskPointer);
                  });
                }
                onImageUpload();
              }}
              {...dragProps}
              className="upload__image_btn"
            >
              <CloudUploadIcon
                style={{
                  height: "50px",
                  width: "50px",
                  display: "block",
                  marginRight: "20px",
                }}
              />
              or
              <Button
                variant="contained"
                style={{
                  marginLeft: "20px",
                }}
              >
                上传照片
              </Button>
            </div>
          </div>
        )}
      </ImageUploading>
    </div>
  ) : null;
}
