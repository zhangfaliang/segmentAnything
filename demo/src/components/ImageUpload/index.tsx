import ImageUploading from "react-images-uploading";
import React, { useState, useContext, CSSProperties, useEffect } from "react";
import PacmanLoader from "react-spinners/PacmanLoader";
import "./index.scss";
import { uploadData } from "../../../request/index";
import AppContext from "../hooks/createContext";
import { ToastContainer, toast } from "react-toastify";
import { isArray } from "lodash";
import { handleImageScale } from "../../components/helpers/scaleHelper";

const maxSize = 5;
export function ImageUpload({
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
    startUpMask: [startUpMask, setStartUpMask],
    maskImg: [, setMaskImg],
    previousMask: [, setPreviousMask],
    mergedMask: [, setMergedMask],
  } = useContext(AppContext)!;
  const [images, setImages] = useState([]);
  let [color, setColor] = useState("#2e432c");
  const maxNumber = 69;
  const uploadImg = async ({ imageList }: any) => {
    const { data_url, file } = imageList[0];
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
        console.log("base64URL", base64URL);
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
      // const reader = new FileReader();
      // reader.readAsDataURL(blob);
      // reader.onload = function (result) {
      //   debugger;
      // };
      // reader.onerror = function (error) {};
    }

    // setLoading(true);
    // const { data, code, message } =
    //   (await uploadData({
    //     url: uploadURL,
    //     data: {
    //       imgData: data_url.replace("data:image/jpeg;base64,", ""),
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

  const onChange = (imageList: any, addUpdateIndex: any) => {
    // data for submit
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
  return (
    <div className="imageUploading_wrapper">
      <ToastContainer />
      {loading && (
        <div className="imageUp_loading_true">
          <PacmanLoader
            size={40}
            color={color}
            loading={loading}
            cssOverride={override}
            aria-label="Loading Spinner"
            data-testid="loader"
            speedMultiplier={1}
          />
        </div>
      )}

      <ImageUploading
        // multiple
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
            {/* {images?.length ? (
              <button onClick={onImageRemoveAll}>Remove all images</button>
            ) : (
             
            )} */}
            <button
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
              上传图片
            </button>
            {showToImgList && (
              <button
                style={isDragging ? { color: "red" } : undefined}
                onClick={clickToImageList}
                {...dragProps}
                className="upload__image_btn"
              >
                图片列表页
              </button>
            )}
          </div>
        )}
      </ImageUploading>
    </div>
  );
}
export default ImageUpload;
