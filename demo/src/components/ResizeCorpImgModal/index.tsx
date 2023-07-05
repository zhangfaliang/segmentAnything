import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputAdornment from "@mui/material/InputAdornment";
import FormHelperText from "@mui/material/FormHelperText";
import FormControl from "@mui/material/FormControl";
import { postData } from "../../../request/index";
import { toast } from "react-toastify";
export default function ResizeCorpImgModal({
  open,
  setOpen,
  width,
  height,
  setValues,
  values,
  cropData,
  localUpLoadImgData,
  setLocalUpLoadImgData,
  setCropData,
}: any) {
  const handleClose = ({}) => {
    setOpen(false);
  };
  const handleChange = (prop: any) => (event: any) => {
    const value = event.target.value;
    const { autoScaleValue, imgHeight, imgWidth }: any = values;
    if (value < 0) return;
    var providedWidth = 0; // 提供的宽度
    var providedHeight = 0; // 提供的高度
    if (autoScaleValue) {
      if ("width" === prop) {
        providedWidth = value;
      } else {
        providedHeight = value;
      }
      const aspectRatio = 1.16; // 宽高比
      var calculatedWidth, calculatedHeight;
      if (providedWidth) {
        // 当设置宽度时，根据宽度计算高度
        calculatedWidth = providedWidth;
        calculatedHeight = calculatedWidth * aspectRatio;
      } else if (providedHeight) {
        // 当设置高度时，根据高度计算宽度
        calculatedHeight = providedHeight;
        calculatedWidth = calculatedHeight / aspectRatio;
      }
    } else {
      if ("width" === prop) {
        calculatedWidth = value;
        calculatedHeight = imgHeight;
      } else {
        calculatedHeight = value;
        calculatedWidth = imgWidth;
      }
    }
    setValues({
      ...values,
      imgHeight: Number(calculatedHeight),
      imgWidth: Number(calculatedWidth),
    });
  };
  // const handleAutoScale = (event: any) => {
  //   const value = event.target.checked;
  //   setValues({
  //     ...values,
  //     autoScaleValue: value,
  //   });
  // };

  const handleResize = async () => {
    const { imgHeight, imgWidth }: any = values;
    if (imgHeight <= 0 || imgWidth <= 0) return;
    const image: any = document.getElementById("corp_img_component");
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
    const fileSize = ((base64Data.length + padding) * 0.75) / 1024; // 单位为KB
    const size = fileSize.toFixed(2);
    image.src = base64URL;
    if (cropData) {
      setCropData(base64URL);
    } else {
      setLocalUpLoadImgData({
        ...localUpLoadImgData,
        data_url: base64URL,
        size: size,
      });
    }
    const { data, code, message } =
      (await postData({
        url: "/generate/mask",
        isNodeServer: true,
        data: {
          imgData: base64URL.replace(
            /data:image\/(jpeg|png|jpg|gif);base64,/,
            ""
          ),
          imgName: localUpLoadImgData.imgName.replace(
            /(\.png|\.jpg|\.jpeg|\.webp)$/,
            `@_@${new Date().getTime()}$1`
          ), //file.name,
          size: size,
        },
      })) || {};
    setOpen(false);

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
  return (
    <React.Fragment>
      <Dialog fullWidth maxWidth={"md"} open={open} onClose={handleClose}>
        <DialogTitle>图片尺寸为</DialogTitle>
        <DialogContent>
          <DialogContentText>
            建议调整图片大小，1000*1160 更能适合webui产出,
            （请注意等比缩放为1:1.16）
          </DialogContentText>
          <FormControl sx={{ m: 1, width: "25ch" }} variant="outlined">
            <OutlinedInput
              value={width}
              id="outlined-adornment-width"
              endAdornment={<InputAdornment position="end">px</InputAdornment>}
              aria-describedby="outlined-width-helper-text"
              inputProps={{
                "aria-label": "width",
              }}
              onChange={handleChange("width")}
              type="number"
            />
            <FormHelperText id="outlined-width-helper-text">
              宽度
            </FormHelperText>
          </FormControl>
          <FormControl sx={{ m: 1, width: "25ch" }} variant="outlined">
            <OutlinedInput
              value={height}
              id="outlined-adornment-height"
              endAdornment={<InputAdornment position="end">px</InputAdornment>}
              aria-describedby="outlined-height-helper-text"
              inputProps={{
                "aria-label": "height",
              }}
              onChange={handleChange("height")}
              type="number"
            />
            <FormHelperText id="outlined-height-helper-text">
              高度
            </FormHelperText>
          </FormControl>
          {/* <Box
            noValidate
            component="form"
            sx={{
              display: "flex",
              width: "fit-content",
              m: "auto",
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  onChange={handleAutoScale}
                  checked={values?.autoScaleValue}
                />
              }
              label="等比缩放"
            />
          </Box> */}
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={handleClose}>
            关闭
          </Button>
          <Button variant="contained" onClick={handleResize}>
            确认
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
