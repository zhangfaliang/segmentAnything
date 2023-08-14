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
import JSZip from "jszip";
import "./index.scss";

const CropImg = ({ handleMouseMove, uploadURL = "/save_image" }: any) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [aspect, setAspect] = useState<number | undefined>(16 / 9);
  const [downImg, setDownImg] = useState("");

  const {
    image: [image, setImage],
    maskImg: [maskImg, setMaskImg],
    processImgType: [processImgType, setProcessImgType],
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
  let name = "";
  if (image?.src) {
    const pathArr = image?.src?.split("/");
    name = pathArr[pathArr?.length - 1];
  }
  useEffect(() => {
    if (image?.src) {
      const img = new Image();
      img.crossOrigin = "anonymous"; // 设置为匿名跨域请求
      img.src = image?.src;
      // 等待图片加载完成
      img.onload = function () {
        // 创建一个 Canvas 元素
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        // 获取 2D 上下文
        const ctx: any = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        // 将 Canvas 数据转换为 Base64 编码
        const base64Data = canvas.toDataURL("image/jpeg");
        setDownImg(
          base64Data.replace(/data:image\/(jpeg|png|jpg|gif);base64,/, "")
        );
      };
    }
  }, [image?.src]);

  const maskImageClasses = `absolute opacity-40 pointer-events-none`;
  const addCutOutObject = () => {
    if (!maskImg?.src) {
      toast(`🔥  点击图片任意位置可以获取mask`, {
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

    setMaskImgList([
      ...maskImgList,
      { src: maskImg?.src, name: name.replace(".", "_mask.") },
    ]);
    setShowMaskImgList(true);
  };

  function downloadFolder({ maskSrc, maskName }: any) {
    const imgData1 = maskSrc.replace(
      /data:image\/(jpeg|png|jpg|gif);base64,/,
      ""
    ); // 替换为第一个图片的 base64 编码数据
    const imgData2 = downImg; // 替换为第二个图片的 base64 编码数据

    // 创建一个新的 JSZip 实例
    const zip = new JSZip();

    // 将图片数据添加到 ZIP 文件夹中
    zip.file(maskName, imgData1, { base64: true });
    zip.file(name, imgData2, { base64: true });
    // 生成 ZIP 文件
    zip.generateAsync({ type: "blob" }).then(function (blob: any) {
      // 创建一个链接元素并模拟点击来触发下载
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = maskName.replace("_mask.png", ""); // 下载的 ZIP 文件名
      link.click();
    });
  }

  const handleClick = ({ maskSrc, maskName }: any) => {
    downloadFolder({ maskSrc, maskName });
  };

  return (
    <div className="mask_wrapper">
      <div className="mask_img">
        {image && (
          <div className="use_img_operate_wrapper">
            <ToastContainer />
            <div className="crop_btn_group_wrapper">
              <Button variant="contained" onClick={addCutOutObject}>
                <PlaylistAddIcon />
                添加到mask列表
              </Button>
              {/* <Button variant="contained">
                <AddTaskIcon
                  style={{
                    marginRight: "5px",
                  }}
                />{" "}
                获取白底图片(可用于webui img2img)
                <a
                  href={image.src}
                  download={name.replace(".", "_process_bg.")}
                >
                  {" "}
                  获取白底图片(可用于webui img2img)
                </a>
              </Button> */}
            </div>
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
        )}
      </div>

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
          maskImgList?.map(({ src, name }: any, index: any) => {
            return (
              <div key={index}>
                <img src={src} alt={name} title={name} />
                <Button
                  onClick={() => handleClick({ maskSrc: src, maskName: name })}
                  className="get_mask_item"
                  variant="contained"
                >
                  <AddTaskIcon
                    style={{
                      marginRight: "5px",
                    }}
                  />
                  Download
                  {/* <a href={src} download={name}>
                    Download
                  </a> */}
                </Button>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default CropImg;
