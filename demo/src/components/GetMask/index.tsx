import React, { useState, useContext, useRef, useEffect } from "react";
import AppContext from "../hooks/createContext";
import Button from "@mui/material/Button";
import AddTaskIcon from "@mui/icons-material/AddTask";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import { useNavigate } from "react-router-dom";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ListAltIcon from "@mui/icons-material/ListAlt";
import { get } from "lodash";
import TextSnippetIcon from "@mui/icons-material/TextSnippet";
import Typography from "@mui/material/Typography";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./index.scss";

const CropImg = ({ handleMouseMove, uploadURL = "/save_image" }: any) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [aspect, setAspect] = useState<number | undefined>(16 / 9);
  const {
    image: [image, setImage],
    maskImg: [maskImg, setMaskImg],
    processImgType: [processImgType, setProcessImgType],
    previousMask: [, setPreviousMask],
    mergedMask: [, setMergedMask],
    maskImgList: [maskImgList, setMaskImgList],
    showMaskImgList: [showMaskImgList, setShowMaskImgList],
  } = useContext(AppContext)!;
  const navigate = useNavigate();

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    if (aspect) {
      const { width, height } = e.currentTarget;
    }
  }

  useEffect(() => {
    setAspect(undefined);
    return () => {
      setMaskImgList([]);
    };
  }, []);

  const maskImageClasses = `absolute opacity-40 pointer-events-none`;
  const addCutOutObject = () => {
    debugger;
    if (!maskImg?.src) {
      toast(`🔥  点击图片任意任意位置可以获取mask`, {
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
    setMaskImgList([...maskImgList, maskImg?.src]);
    setShowMaskImgList(true);
  };
  console.log(maskImgList, "maskImgList");

  return (
    <div className="mask_wrapper">
      <ToastContainer />
      {image && (
        <div className="use_img_operate_wrapper">
          <div className="crop_btn_group_wrapper">
            <Button variant="contained" onClick={addCutOutObject}>
              <PlaylistAddIcon />
              添加到mask列表
            </Button>
            <Button variant="contained">
              <AddTaskIcon
                style={{
                  marginRight: "5px",
                }}
              />{" "}
              <a href={image.src} download>
                {" "}
                获取白底图片(可用于webui img2img)
              </a>
            </Button>
          </div>
          <div>
            <div className="use_img_mask_wrapper">
              <img
                ref={imgRef}
                alt="Crop me"
                onLoad={onImageLoad}
                onClick={(e: any) => {
                  processImgType === "mask" && handleMouseMove(e);
                }}
                onContextMenu={(event) => {
                  if (processImgType !== "mask") return;
                  event.preventDefault();
                  handleMouseMove({ ...event, clickType: "right" });
                }}
                src={image.src}
                className={`target_img`}
                id="use_image"
              ></img>
              {maskImg && (
                <img
                  src={maskImg.src}
                  className={`${maskImageClasses} target_img use_img_mask`}
                ></img>
              )}
            </div>
          </div>
        </div>
      )}
      {!image && (
        <div className="no_mask_data">
          <div className="no_mask_data_test">
            <TextSnippetIcon />
            <Typography variant="h5" gutterBottom>
              无mask数据，可以去列表选择或者重新上传
            </Typography>
          </div>
          <div>
            <Button
              variant="contained"
              style={{ height: "40px", width: "180px" }}
              onClick={() => {
                navigate("/");
              }}
            >
              <ListAltIcon />
              选择图片
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                navigate("/upload");
              }}
              style={{ height: "40px", marginLeft: "20px", width: "180px" }}
            >
              <CloudUploadIcon
                style={{
                  display: "block",
                  marginRight: "3px",
                }}
              ></CloudUploadIcon>
              上传照片
            </Button>
          </div>
        </div>
      )}

      <div className="hover_and_click_maskList">
        <div>mask 列表 </div>
        {!!get(maskImgList, "length") &&
          maskImgList?.map((item) => {
            return <img src={item} alt="" />;
          })}
      </div>
    </div>
  );
};

export default CropImg;
