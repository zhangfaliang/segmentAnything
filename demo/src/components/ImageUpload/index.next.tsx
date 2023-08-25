import "./index.scss";
import React, { useState, useContext, useEffect } from "react";
import "./index.scss";
import AppContext from "../hooks/createContext";
import { ToastContainer, toast } from "react-toastify";
import { handleImageScale } from "../../components/helpers/scaleHelper";
import ImageUploading from "react-images-uploading";
import Button from "@mui/material/Button";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
const maxSize = 400;
const maxNumber = 200;

export default function App({ loadFile }: any) {
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
        targetWidth = maxWidth;
        targetHeight = Math.round(maxWidth * (originHeight / originWidth));
      }
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      context && context.clearRect(0, 0, targetWidth, targetHeight);
      // 图片绘制
      context && context.drawImage(img, 0, 0, targetWidth, targetHeight);

      resolve(canvas.toDataURL(type || "image/jpg"));
    });
  };
  const {
    image: [, setImage],
    maskImg: [, setMaskImg],
    previousMask: [, setPreviousMask],
    mergedMask: [, setMergedMask],
    localUpLoadImgData: [localUpLoadImgData, setLocalUpLoadImgData],
    localUpLoadImgArrayData: [
      localUpLoadImgArrayData,
      setLocalUpLoadImgArrayData,
    ],
    imageArray: [, setImageArray],
    loading: [, setLoading],
  } = useContext(AppContext)!;
  const [images, setImages] = useState<File[]>([]);
  useEffect(() => {
    setLocalUpLoadImgArrayData([]);
  }, []);
  const uploadImg = async ({ imageList }: any) => {
    let imgArray: any = [];
    let localUpLoadImgArrayData: any = [];
    for (var i = 0; i < imageList?.length; i++) {
      const { data_url, file }: any = imageList[i];
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
          // const base64URL: any = await compressImg(img, file.type, 2000, 2320);
          const base64URL: any = await compressImg(img, file.type, 2000, 2320);
          const newImg = new Image();
          newImg.src = base64URL;
          newImg.onload = () => {
            const { height, width, samScale } = handleImageScale(newImg);
            newImg.width = width;
            newImg.height = height;
            // setImage(newImg);
            imgArray.push(newImg);
          };
          setMaskImg(null);
          setPreviousMask("");
          setMergedMask("");
          localUpLoadImgArrayData.push({
            data_url: base64URL,
            imgName: file.name,
            size: file.size,
          });
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
    }
    setImageArray(imgArray);
    setLocalUpLoadImgArrayData(localUpLoadImgArrayData);
    setLoading(false);
  };

  const onChange = (imageList: any) => {
    setImages(imageList);
    if (imageList?.length) {
      setLoading(true);
      uploadImg({ imageList });
    }
  };
  const onError = (imageList: any) => {};

  return !localUpLoadImgArrayData.length ? (
    <div className="App">
      <ToastContainer />
      <h1>请上传图片</h1>
      <p>支持格式：jpg、png、jpeg、webp</p>
      <ImageUploading
        multiple={true}
        value={images}
        onChange={onChange}
        onError={onError}
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
                onImageRemoveAll();
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
              <Button
                variant="contained"
                style={{
                  marginLeft: "20px",
                }}
              >
                <CloudUploadIcon
                  style={{
                    height: "50px",
                    width: "50px",
                    display: "block",
                    marginRight: "20px",
                  }}
                />
                上传图片
              </Button>
            </div>
          </div>
        )}
      </ImageUploading>
    </div>
  ) : null;
}
