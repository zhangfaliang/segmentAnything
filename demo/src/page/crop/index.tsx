import React, { useState, useContext, useEffect, useRef } from "react";
import "cropperjs/dist/cropper.css";
import ItemCrop from "./ItemCrop";
import "./index.scss";
import AppContext from "../../components/hooks/createContext";
import Button from "@mui/material/Button";
import CropIcon from "@mui/icons-material/Crop";
import AddTaskIcon from "@mui/icons-material/AddTask";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { get, set } from "lodash";
import { postData } from "../../../request/index";

export const Crop = () => {
  const {
    loading: [loading, setLoading],
    rePolling: [rePolling, setRePolling],
    localUpLoadImgArrayData: [
      localUpLoadImgArrayData,
      setLocalUpLoadImgArrayData,
    ],
  } = useContext(AppContext)!;

  const [cropperDataArray, setCropperDataArray]: any = useState([]);
  const cropEle: any = useRef<HTMLImageElement>(null);
  const [values, setValues]: any = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    rotate: 0,
    scaleX: 1,
    scaleY: 1,
    imgHeight: 0,
    imgWidth: 0,
    naturalHeight: 0,
    naturalWidth: 0,
    autoScaleValue: true,
  });
  const [valuesArray, setValuesArray]: any = useState([]);

  const handleChange = (prop: any) => (event: any) => {
    if (event.target.value < 0) return;
    const processValue = `${event.target.value}`.replace(/^0/, "");
    let width = 0;
    let height = 0;
    if (prop === "width") {
      width = Number(processValue);
      height = Number(processValue) * 1.16;
    } else {
      height = Number(processValue);
      width = Number(processValue) / 1.16;
    }
    const data: any = {
      ...values,
      width,
      height,
    };

    if (cropEle?.current?.cropperArray?.length) {
      cropEle?.current?.cropperArray?.forEach((item: any) => {
        console.log(item?.crop, item?.setData);
        item?.crop();
        item?.setData(data);
      });
    }

    setValues(data);
  };
  const handleCrop = () => {
    setLoading(true);
    if (cropEle?.current?.cropperArray?.length) {
      const cropperArray: any = [];
      cropEle?.current?.cropperArray?.forEach((item: any) => {
        cropperArray.push(item.getCroppedCanvas().toDataURL());
      });
      setCropperDataArray(cropperArray);
      setTimeout(() => {
        cropEle?.current?.cropperArray?.forEach((item: any) => {
          item.clear();
        });
      }, 20);
    }
    setLoading(false);
  };

  const handleAutoFullParams = () => {
    if (cropEle?.current?.cropperArray?.length) {
      cropEle?.current?.cropperArray?.forEach((item: any) => {
        item?.crop();
      });
    }
  };

  const handleRestUpload = () => {
    if (cropEle?.current?.cropperArray?.length) {
      cropEle?.current?.cropperArray?.forEach((item: any) => {
        item.clear();
      });
    }
    if (cropEle?.current?.cropperArray?.length) {
      cropEle.current.cropperArray = [];
    }

    setLocalUpLoadImgArrayData([]);
    setCropperDataArray([]);
  };
  const setApi = async ({ values, id_value, imgName }: any) => {
    const { imgHeight, imgWidth }: any = values;
    if (imgHeight <= 0 || imgWidth <= 0) return;
    const image: any = document.getElementById(
      `${id_value}_corp_img_component`
    );
    image.style.width = imgWidth + "px";
    image.style.height = imgHeight + "px";
    const canvas = document.createElement("canvas");
    const context: any = canvas.getContext("2d");
    canvas.width = imgWidth;
    canvas.height = imgHeight;
    context.drawImage(image, 0, 0, imgWidth, imgHeight);
    const base64URL = canvas.toDataURL("image/png");
    const base64Data = base64URL.split(",")[1];
    const padding =
      base64Data.length % 4 === 0 ? 0 : 4 - (base64Data.length % 4);
    const fileSize = (base64Data.length + padding) / 1024; // 单位为KB
    const size = fileSize.toFixed(2);

    const { data, code, message } =
      (await postData({
        url: "/generate/mask",
        isNodeServer: true,
        data: {
          imgData: base64URL.replace(
            /data:image\/(jpeg|png|jpg|gif);base64,/,
            ""
          ),
          imgName: imgName
            .replace(
              /(\.png|\.jpg|\.jpeg|\.webp)$/,
              `@_@${new Date().getTime()}$1`
            )
            .replace(/ +|\-|\/|\+|/g, ``), //file.name,
          size: size,
        },
      })) || {};
    setLoading(false);
    setRePolling(true);
    handleRestUpload && handleRestUpload();
    if (code === -1) {
      toast.error(`🔐--${message}`, {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    }
  };
  const handleGenerate = async () => {
    setLoading(true);

    if (cropEle?.current?.cropperArray?.length) {
      let array: any = [];
      cropEle?.current?.cropperArray?.forEach((item: any, index: any) => {
        const imgData = item.getImageData();
        // if (imgData?.height) {
        //   toast.error(`已选择裁剪区域，请先处理裁剪`, {
        //     position: "top-center",
        //     autoClose: 5000,
        //     hideProgressBar: false,
        //     closeOnClick: true,
        //     pauseOnHover: true,
        //     draggable: true,
        //     progress: undefined,
        //     theme: "colored",
        //   });
        //   return;
        // }
        array.push({
          imgHeight: imgData?.naturalHeight,
          imgWidth: imgData?.naturalWidth,
          naturalHeight: imgData?.naturalHeight,
          naturalWidth: imgData?.naturalWidth,
          rotate: 0,
          scaleX: 1,
          scaleY: 1,
        });

        setApi({
          values: {
            imgHeight: imgData?.naturalHeight,
            imgWidth: imgData?.naturalWidth,
            naturalHeight: imgData?.naturalHeight,
            naturalWidth: imgData?.naturalWidth,
            rotate: 0,
            scaleX: 1,
            scaleY: 1,
          },
          id_value: item?.id_value,
          imgName: item?.imgName,
        });
      });
    }
    //
  };
  const readyCallBack = (cropper: any) => {
    if (cropEle && cropper) {
      if (!cropEle?.current?.cropperArray) {
        cropEle.current.cropperArray = [];
      }
      const res = cropEle.current.cropperArray.filter(
        (item: any) => item?.imgName === cropper?.imgName
      );
      if (res?.length) {
        cropEle?.current?.cropperArray?.forEach((item: any, index: any) => {
          if (item?.imgName === cropper?.imgName) {
            cropEle.current.cropperArray[index] = cropper;
          }
        });
      } else {
        cropEle.current.cropperArray.push(cropper);
      }

      cropper?.crop();
    }
  };
  console.log(valuesArray, "valuesArrayvaluesArrayvaluesArray");

  return localUpLoadImgArrayData?.length ? (
    <>
      <ToastContainer />

      <div className="crop_wrapper_content" ref={cropEle}>
        <div className="crop_wrapper_content_center">
          <div className="crop_btn_group_wrapper">
            <Button variant="contained" onClick={handleRestUpload}>
              <AddAPhotoIcon />
              重新上传
            </Button>

            <Button variant="contained" onClick={handleGenerate}>
              <AddTaskIcon
                style={{
                  marginRight: "5px",
                }}
              />{" "}
              生成mask
            </Button>
            <Button variant="contained" onClick={handleAutoFullParams}>
              <AutoFixHighIcon
                style={{
                  marginRight: "5px",
                }}
              />{" "}
              选中全部展示裁剪框
            </Button>
            {!!valuesArray.length && (
              <Button variant="contained" onClick={handleCrop}>
                <CropIcon
                  style={{
                    marginRight: "5px",
                  }}
                />{" "}
                裁剪
              </Button>
            )}
          </div>
          <div className="crop_item_wrapper">
            {localUpLoadImgArrayData.map((item: any, index: any) => (
              <ItemCrop
                key={item.imgName}
                item={item}
                id_value={`key_${index}`}
                key_index={index}
                readyCallBack={readyCallBack}
                // data={data}
                autoCrop={false}
                valuesArray={valuesArray}
                setValuesArray={setValuesArray}
                cropData={get(cropperDataArray, index, "")}
                setCropperDataArray={setCropperDataArray}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  ) : null;
};

export default Crop;
