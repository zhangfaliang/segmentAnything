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
import ResizeCorpImgModal from "../../components/ResizeCorpImgModal";

import { postData } from "../../../request/index";

export const Crop = () => {
  const {
    localUpLoadImgData: [localUpLoadImgData, setLocalUpLoadImgData],
    loading: [loading, setLoading],
    rePolling: [rePolling, setRePolling],
  } = useContext(AppContext)!;
  const [cropData, setCropData]: any = useState();
  const [cropper, setCropper]: any = useState();
  const [autoCrop, setAutoCrop]: any = useState(false);
  const [openResize, setOpenResize] = React.useState(false);

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
    if (!autoCrop) {
      cropper.crop();
      setAutoCrop(true);
    }
    setValues(data);
    cropper.setData(data);
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
  };
  const onCrop = (e: any) => {
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
  const handleRestUpload = () => {
    // cropper.crop();
    setAutoCrop(false);
    cropper.autoCrop = false;
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
    const imgData = cropper.getImageData();
    if (values?.height) {
      toast.error(`已选择裁剪区域，请先处理裁剪`, {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      return;
    }

    setValues({
      ...values,
      imgHeight: imgData?.naturalHeight,
      imgWidth: imgData?.naturalWidth,
      naturalHeight: imgData?.naturalHeight,
      naturalWidth: imgData?.naturalWidth,
    });
    setOpenResize(true);
  };

  return localUpLoadImgData ? (
    <>
      <ToastContainer />
      <ResizeCorpImgModal
        width={values.imgWidth.toFixed(0)}
        height={values.imgHeight.toFixed(0)}
        setRePolling={setRePolling}
        rePolling={rePolling}
        open={openResize}
        setOpen={setOpenResize}
        setValues={setValues}
        values={values}
        cropper={cropper || {}}
        cropData={cropData}
        localUpLoadImgData={localUpLoadImgData}
        setLocalUpLoadImgData={setLocalUpLoadImgData}
        setCropData={setCropData}
        setLoading={setLoading}
        handleRestUpload={handleRestUpload}
      />
      <div className="crop_wrapper_content">
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
          </div>
          <Cropper
            className="crop_wrapper_content_left"
            autoCropArea={1}
            autoCrop={autoCrop}
            modal={true}
            // style={{ height: "", width: "auto" }}
            initialAspectRatio={1 / 1.16}
            src={cropData || localUpLoadImgData.data_url}
            viewMode={2}
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
          />
        </div>
        <Box
          className="crop_wrapper_content_right"
          sx={{ width: 400, paddingLeft: 5 }}
        >
          <Grid container spacing={1}>
            <Grid item xs={12} md={12}>
              <Button variant="contained" onClick={handleAutoFullParams}>
                <AutoFixHighIcon
                  style={{
                    marginRight: "5px",
                  }}
                />{" "}
                自动补全裁剪参数
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
                value={values.width > 0 ? values.width?.toFixed(0) : ""}
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
                value={values.height > 0 ? values.height.toFixed(0) : ""}
                onChange={handleChange("height")}
                variant="standard"
              />
            </Grid>

            <Grid item xs={12} md={12}>
              {/* <Button variant="contained" onClick={handleReset}>
                <CleaningServicesIcon
                  style={{
                    marginRight: "5px",
                  }}
                />{" "}
                重新裁剪
              </Button> */}
              {!!values.width && (
                <Button variant="contained" onClick={handleCrop}>
                  <CropIcon
                    style={{
                      marginRight: "5px",
                    }}
                  />{" "}
                  裁剪
                </Button>
              )}
            </Grid>
          </Grid>
        </Box>
      </div>
    </>
  ) : null;
};

export default Crop;
