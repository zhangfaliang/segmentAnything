import React, { useState, useContext, useEffect, useRef } from "react";
import Cropper from "./next.index";
import AppContext from "../../components/hooks/createContext";

const ItemCrop = ({
  item,
  readyCallBack,
  autoCrop,
  values,
  cropData,
  setCropperDataArray,
  id_value,
  key_index,
  valuesArray,
  setValuesArray,
}: any) => {
  const {
    localUpLoadImgData: [localUpLoadImgData, setLocalUpLoadImgData],
    loading: [loading, setLoading],
    rePolling: [rePolling, setRePolling],
  } = useContext(AppContext)!;
  const [cropper, setCropper]: any = useState();

  const onCrop = (e: any, ...other: any) => {
    const processValueWidth = Number(`${e.detail.width}`.replace(/^0/, ""));
    const processValueHeight = Number(`${e.detail.height}`.replace(/^0/, ""));
    const data: any = {
      ...values,
      scaleX: e.detail.scaleX,
      scaleY: e.detail.scaleY,
      rotate: e.detail.rotate,
      x: e.detail.x,
      y: e.detail.y,
      width: processValueWidth || "",
      height: processValueHeight || "",
    };
    if (valuesArray && valuesArray[key_index]) {
      valuesArray[key_index] = data;
      setValuesArray([...valuesArray]);
    } else {
      let arr = [];
      arr[key_index] = data;
      setValuesArray([...arr]);
    }
  };

  useEffect(() => {
    return () => {
      setLocalUpLoadImgData(null);
      setCropperDataArray([]);
    };
  }, []);

  return (
    <Cropper
      className="crop_wrapper_content_left"
      autoCropArea={1}
      autoCrop={autoCrop}
      modal={true}
      style={{ height: "400px", width: "366px", padding: "2px" }}
      initialAspectRatio={1 / 1.16}
      aspectRatio={1 / 1.16}
      src={cropData || item?.data_url}
      viewMode={1}
      background={false}
      responsive={false}
      guides={true}
      center={true}
      data={values}
      minContainerWidth={0}
      minContainerHeight={0}
      highlight={true}
      rotatable={false}
      scalable={false}
      zoomable={false}
      crop={onCrop}
      movable={true}
      setCropper={setCropper}
      cropper={cropper}
      checkCrossOrigin={true}
      id_value={id_value}
      readyCallBack={readyCallBack}
      imgName={item.imgName}
    />
  );
};

export default ItemCrop;
