// Copyright (c) Meta Platforms, Inc. and affiliates.
// All rights reserved.

// This source code is licensed under the license found in the
// LICENSE file in the root directory of this source tree.

import React, { useContext, useEffect, useState } from "react";
import AppContext from "./hooks/createContext";
import { ToolProps } from "./helpers/Interfaces";
import * as _ from "underscore";
import CropImg from "./CropImg";
// import DrawImg from "./DrawImg";
import "./Tool.css";

const processMask = ({ base64Url }: any) => {
  // 创建一个 Image 对象
  var image = new Image();
  // 将图片赋值给 Image 对象的 src 属性
  image.src = base64Url;
  // 等待图片加载完成，将图片绘制到 canvas 上
  image.onload = function () {
    var canvas = document.createElement("canvas");
    var ctx: any = canvas.getContext("2d");
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);

    // 将图片转换成 RGBA 格式，并为每个像素的 alpha 分量赋值
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var pixelData = imageData.data;
    for (var i = 0; i < pixelData.length; i += 4) {
      var r = pixelData[i];
      var g = pixelData[i + 1];
      var b = pixelData[i + 2];
      var alpha = calculateAlpha(r, g, b); // 根据 RGB 值计算 alpha 值
      pixelData[i + 3] = alpha; // 将 alpha 值赋值给每个像素的 alpha 分量
    }
    ctx.putImageData(imageData, 0, 0);

    // 将图片保存为带有 alpha 通道的 PNG 格式
    var pngDataUrl = canvas.toDataURL("image/png");
    var a = document.createElement("a");
    a.href = pngDataUrl;
    a.download = "image.png";
    a.click();
  };

  // 根据 RGB 值计算 alpha 值的函数，可以根据具体需求进行修改
  function calculateAlpha(r: any, g: any, b: any) {
    // 例如，假设 alpha 值与绿色值成反比例关系
    return 255 - g;
  }
};

const Tool = ({ handleMouseMove }: ToolProps) => {
  const {
    image: [image],
    maskImg: [maskImg, setMaskImg],
    startUpMask: [startUpMask, setStartUpMask],
  } = useContext(AppContext)!;

  // Determine if we should shrink or grow the images to match the
  // width or the height of the page and setup a ResizeObserver to
  // monitor changes in the size of the page
  const [shouldFitToWidth, setShouldFitToWidth] = useState(true);

  const [nextMaskImg, setNextMaskImg] = useState("");
  const bodyEl = document.body;
  const fitToPage = () => {
    if (!image) return;
    const imageAspectRatio = image.width / image.height;
    const screenAspectRatio = window.innerWidth / window.innerHeight;
    setShouldFitToWidth(imageAspectRatio > screenAspectRatio);
  };
  const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      if (entry.target === bodyEl) {
        fitToPage();
      }
    }
  });
  useEffect(() => {
    fitToPage();
    resizeObserver.observe(bodyEl);
    return () => {
      resizeObserver.unobserve(bodyEl);
    };
  }, [image]);
  useEffect(() => {
    if (maskImg?.src) {
      setNextMaskImg(maskImg?.src);
      processMask({ base64Img: maskImg?.src });
    }
  }, [maskImg?.src]);

  // Render the image and the predicted mask image on top
  const maskImageClasses = `absolute opacity-40 pointer-events-none`;

  return (
    <div className="wrapper">
      {image && (
        <div id="useImgWrapper" className="img-wrapper">
          <CropImg handleMouseMove={handleMouseMove} />
        </div>
      )}
      {maskImg && (
        <img
          src={maskImg.src}
          className={`${maskImageClasses} target_img`}
        ></img>
      )}
      {image && (
        <a className="down_img_btn" href={image.src} download>
          {" "}
          下载白底图片(可用于webui img2img)
        </a>
      )}
    </div>
  );
};

export default Tool;
