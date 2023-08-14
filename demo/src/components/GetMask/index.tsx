import React, { useState, useContext, useRef, useEffect } from "react";
import AppContext from "../hooks/createContext";
import Button from "@mui/material/Button";
import AddTaskIcon from "@mui/icons-material/AddTask";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';
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
  const isControlKey = useRef(false)
  const [isDelete, setIsDelete] = useState(false)
  const [aspect, setAspect] = useState<number | undefined>(16 / 9);

  const {
    image: [image, setImage],
    maskImg: [maskImg, setMaskImg],
    previousMask: [, setPreviousMask],
    processImgType: [processImgType, setProcessImgType],
    maskImgList: [maskImgList, setMaskImgList],
    showMaskImgList: [showMaskImgList, setShowMaskImgList],
    rangeRects: [rangeRects, setRangeRects]
  } = useContext(AppContext)!;
  const navigate = useNavigate();

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    if (aspect) {
      const { width, height } = e.currentTarget;
    }
  }

  useEffect(() => {
    setAspect(undefined);
    document.addEventListener('keydown', documentKeydown) 
    document.addEventListener('keyup', documentKeyup)
    return () => {
      document.removeEventListener('keydown', documentKeydown )
      document.removeEventListener('keyup', documentKeyup)
      setMaskImgList([]);
    };
  }, []);
  let name = "";
  if (image?.src) {
    const pathArr = image?.src?.split("/");
    name = pathArr[pathArr?.length - 1];
  }
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
  let isMouseDown = useRef(false)
  function getPosition(e: any) {
    if (isControlKey.current) {
      isMouseDown.current = true
      if (isMouseDown.current) {
        let el = e.nativeEvent.target;
        const clientRect = el.getBoundingClientRect();
        let x = e.clientX - Math.ceil(clientRect.left);
        let y = e.clientY - Math.ceil(clientRect.top);
        setRangeRects([...rangeRects, {x, y, w: 0, h: 0, id: new Date().getTime()}])
      }
    }
  }
  function getClientRect(e: any) {
    if (!isMouseDown.current) return
    let el = e.nativeEvent.target;
    const clientRect = el.getBoundingClientRect();
    let currentX = e.clientX - Math.ceil(clientRect.left);
    let currentY = e.clientY - Math.ceil(clientRect.top);
    const [rect] = rangeRects.slice(-1)
    let w = currentX - rect.x;
    let h = currentY - rect.y;
    rect.w = w
    rect.h = h
    rangeRects[rangeRects.length-1] = rect
    setRangeRects([...rangeRects])
    e.preventDefault()
  }
  function onMouseUp() {
    isMouseDown.current = false
  }
  function rectMaskClick(i: number) {
    rangeRects.splice(i, 1)
    setRangeRects([...rangeRects])
  }
  function documentKeydown(e: {keyCode: number}) {
    if (e.keyCode == 17) {
      isControlKey.current = true
    }
    if (e.keyCode == 18) {
      setIsDelete(true)
    }
  }
  function documentKeyup(e: {keyCode: number}) {
    if (e.keyCode == 17) {
      isControlKey.current = false
    }
    if (e.keyCode == 18) {
      setIsDelete(false)
    }
  }
  function reset() {
    const parentEle: any = document.getElementById("useImgWrapper")
    const children = parentEle.querySelectorAll(".maskPointer")
    children.forEach((el: HTMLDivElement) => {
      parentEle.removeChild(el)
    });
    setPreviousMask(null)
    setMaskImg(null)
  }
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
              <Button variant="contained">
                <AddTaskIcon
                  style={{
                    marginRight: "5px",
                  }}
                />{" "}
                <a
                  href={image.src}
                  download={name.replace(".", "_process_bg.")}
                >
                  {" "}
                  获取白底图片(可用于webui img2img)
                </a>
              </Button>
              <Button variant="contained" onClick={reset} color="error">
                <RefreshIcon />
                重置
              </Button>
            </div>
            <div className="use_img_mask_wrapper">
              <img
                ref={imgRef}
                alt="Crop me"
                onLoad={onImageLoad}
                onClick={(e: any) => {
                  if (isControlKey.current) return;
                  processImgType === "mask" && handleMouseMove(e);
                }}
                onContextMenu={(event) => {
                  event.preventDefault();
                  if (processImgType !== "mask") return;
                  if (isControlKey.current) return;
                  handleMouseMove({ ...event, clickType: "right" });
                }}
                onMouseDown={(event) => {
                  getPosition(event)
                }}
                onMouseMove={(event) => {
                  getClientRect(event)
                  event.preventDefault();
                }}
                onMouseUp={() => {
                  onMouseUp()
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
              {rangeRects.map((rect: any, i: number) => {
                return <div className={`rect_mask`} key={rect.id}
                  style={{
                    left: rect.x,
                    top: rect.y,
                    width: rect.w + 'px',
                    height: rect.h + 'px',
                    display: rect.w > 5 ? 'block' : 'none',
                    pointerEvents: isDelete ? 'inherit' : 'none'
                  }}
                  onContextMenu={(event) => {
                    event.preventDefault();
                  }}
                >
                  <span
                    className={'close_button'}
                    style={{
                      display: isDelete ? 'block' : 'none',
                    }}
                    onClick={() => {
                      rectMaskClick(i)
                    }}
                  ><CloseIcon /></span>
                </div>
              })}
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
                <Button className="get_mask_item" variant="contained">
                  <AddTaskIcon
                    style={{
                      marginRight: "5px",
                    }}
                  />
                  <a href={src} download={name}>
                    Download
                  </a>
                </Button>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default CropImg;
