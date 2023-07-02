import React, { useState, useContext, useEffect } from "react";
import Cropper from "./next.index";
import "cropperjs/dist/cropper.css";
import "./index.scss";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import AppContext from "../../components/hooks/createContext";
import Button from "@mui/material/Button";
import CropIcon from "@mui/icons-material/Crop";
import AddTaskIcon from "@mui/icons-material/AddTask";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { postData } from "../../../request/index";

export const Crop = () => {
  const {
    localUpLoadImgData: [localUpLoadImgData, setLocalUpLoadImgData],
    loading: [loading, setLoading],
  } = useContext(AppContext)!;
  const [cropData, setCropData]: any = useState();
  const [cropper, setCropper]: any = useState();
  const [autoCrop, setAutoCrop]: any = useState(false);

  const [values, setValues] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    rotate: 0,
    scaleX: 1,
    scaleY: 1,
  });

  const handleChange = (prop: any) => (event: any) => {
    if (event.target.value < 0) return;
    const processValue = `${event.target.value}`.replace(/^0/, "");
    const data: any = {
      ...values,
      [prop]: Number(processValue) || "",
    };
    if (!autoCrop) {
      cropper.crop();
      setAutoCrop(true);
    }
    cropper.setData(data);
    setValues(data);
  };
  const handleCrop = () => {
    if (typeof cropper !== "undefined") {
      setCropData(cropper.getCroppedCanvas().toDataURL());
      // cropper.disable();
    }
  };

  const handleReset = () => {
    if (typeof cropper !== "undefined") {
      setCropData(null);
      cropper.clear();
    }
  };
  const handleAutoFullParams = () => {
    cropper.crop();
    setAutoCrop(true);
    cropper.autoCrop = true;
    cropper.setData({
      x: 0,
      y: 0,
      width: 1000,
      height: 1160,
      rotate: 0,
      scaleX: 1,
      scaleY: 1,
    });
  };
  const onCrop = (e: any) => {
    const processValueWidth = Number(`${e.detail.width}`.replace(/^0/, ""));
    const processValueHeight = Number(`${e.detail.height}`.replace(/^0/, ""));
    const data: any = {
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
  const handleRestUpload = () => {
    setLocalUpLoadImgData(null);
    setCropData(null);
  };
  const handleRemoveBg = async () => {
    setLoading(true);
    const { data, code, message } =
      (await postData({
        url: "/remove_background",
        data: {
          imgData: (cropData || localUpLoadImgData.data_url).replace(
            /data:image\/(jpeg|png|jpg|gif);base64,/,
            ""
          ),
          imgName: localUpLoadImgData.imgName, //file.name,
          size: localUpLoadImgData.size,
        },
      })) || {};

    setLocalUpLoadImgData({
      data_url: "",
      imgName: `${localUpLoadImgData.imgName}_${new Date().getTime()}`,
      size: "",
    });
    // 更改页面图片内容
    setLoading(false);
  };
  const handleGenerate = async () => {
    const { data, code, message } =
      (await postData({
        url: "/generate/mask",
        isNodeServer: true,
        data: {
          imgData: (cropData || localUpLoadImgData.data_url).replace(
            /data:image\/(jpeg|png|jpg|gif);base64,/,
            ""
          ),
          imgName: localUpLoadImgData.imgName.replace(
            /(\.png|\.jpg|\.jpeg|\.webp)$/,
            `@_@${new Date().getTime()}$1`
          ), //file.name,
          size: localUpLoadImgData.size,
        },
      })) || {};
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
    // const { imgURL, npyURL, onnxURL } = data;
    // const url = new URL(imgURL, location.origin);
    // (window as any).loadFile({ imgURL: url, npyURL, onnxURL, data });
  };

  return localUpLoadImgData ? (
    <>
      <ToastContainer />
      <div className="crop_btn_group_wrapper">
        <Button variant="contained" onClick={handleRestUpload}>
          <AddAPhotoIcon />
          重新上传
        </Button>

        <Button variant="contained" onClick={handleCrop}>
          <CropIcon
            style={{
              marginRight: "5px",
            }}
          />{" "}
          裁剪
        </Button>
        <Button variant="contained" onClick={handleGenerate}>
          <AddTaskIcon
            style={{
              marginRight: "5px",
            }}
          />{" "}
          生成mask
        </Button>
      </div>
      <div className="crop_wrapper_content">
        <Cropper
          autoCropArea={1}
          autoCrop={autoCrop}
          modal={true}
          style={{ height: "auto", width: "70%" }}
          initialAspectRatio={1 / 1.16}
          src={cropData || localUpLoadImgData.data_url}
          viewMode={2}
          background={true}
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
        />

        <Box sx={{ width: 400, paddingLeft: 5 }}>
          <Grid container spacing={1}>
            <Grid item xs={12} md={12}>
              <Button variant="contained" onClick={handleAutoFullParams}>
                <AutoFixHighIcon
                  style={{
                    marginRight: "5px",
                  }}
                />{" "}
                自定填充参数
              </Button>
            </Grid>
            <Grid item xs={12} md={12}>
              <TextField
                label="width"
                type="number"
                InputLabelProps={{
                  shrink: true,
                }}
                onChange={handleChange("width")}
                value={values.width > 0 ? values.width?.toFixed() : ""}
                variant="standard"
              />
            </Grid>
            <Grid item xs={12} md={12}>
              <TextField
                label="height"
                type="number"
                InputLabelProps={{
                  shrink: true,
                }}
                value={values.height > 0 ? values.height.toFixed() : ""}
                onChange={handleChange("height")}
                variant="standard"
              />
            </Grid>

            <Grid item xs={12} md={12}>
              <Button variant="contained" onClick={handleReset}>
                <CleaningServicesIcon
                  style={{
                    marginRight: "5px",
                  }}
                />{" "}
                重新裁剪
              </Button>
            </Grid>
          </Grid>
        </Box>
      </div>
    </>
  ) : null;
};

export default Crop;
