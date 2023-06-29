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
import BlurLinearIcon from "@mui/icons-material/BlurLinear";
export const Crop = () => {
  const {
    localUpLoadImgData: [localUpLoadImgData, setLocalUpLoadImgData],
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

  return localUpLoadImgData ? (
    <>
      {" "}
      <div className="crop_btn_group_wrapper">
        <Button variant="contained" onClick={handleRestUpload}>
          <AddAPhotoIcon />
          重新上传
        </Button>
        <Button variant="contained">
          <BlurLinearIcon
            style={{
              marginRight: "5px",
            }}
          />{" "}
          去掉背景
        </Button>
        <Button variant="contained" onClick={handleCrop}>
          <CropIcon
            style={{
              marginRight: "5px",
            }}
          />{" "}
          裁剪
        </Button>
        <Button variant="contained">
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
