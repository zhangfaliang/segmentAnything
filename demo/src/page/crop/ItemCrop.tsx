import React, { useState, useContext, useEffect, useRef } from "react";
import Cropper from "./next.index";
import AppContext from "../../components/hooks/createContext";

const ItemCrop = ({ item, key_str }: any) => {
  const {
    localUpLoadImgData: [localUpLoadImgData, setLocalUpLoadImgData],
    loading: [loading, setLoading],
    rePolling: [rePolling, setRePolling],
    localUpLoadImgArrayData: [
      localUpLoadImgArrayData,
      setLocalUpLoadImgArrayData,
    ],
  } = useContext(AppContext)!;
  const [cropData, setCropData]: any = useState();
  const [cropper, setCropper]: any = useState();
  const [autoCrop, setAutoCrop]: any = useState(false);
  const cropEle: any = useRef<HTMLImageElement>(null);

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
    setValues(data);
  };
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
  useEffect(() => {
    return () => {
      setLocalUpLoadImgData(null);
      setCropData(null);
    };
  }, []);

  return (
    <Cropper
      className="crop_wrapper_content_left"
      autoCropArea={1}
      autoCrop={autoCrop}
      modal={true}
      // style={{ height: "", width: "auto" }}
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
      id_value={key_str}
    />
  );
};

export default ItemCrop;
