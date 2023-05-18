// Copyright (c) Meta Platforms, Inc. and affiliates.
// All rights reserved.

// This source code is licensed under the license found in the
// LICENSE file in the root directory of this source tree.

import React, { useContext } from "react";
import * as _ from "underscore";
import Tool from "./Tool";
import { modelInputProps } from "./helpers/Interfaces";
import AppContext from "./hooks/createContext";

const Stage = () => {
  const {
    clicks: [, setClicks],
    image: [image],
  } = useContext(AppContext)!;

  const getClick = (x: number, y: number, clickType?: any): modelInputProps => {
    return { x, y, clickType: clickType || 1 };
  };
  const canvasDraw = (event: any) => {
    const newImage: any = image;

    const parentEle: any = document.getElementById("useImgWrapper");
    // 获取图片的宽度和高度
    const imageWidth = newImage.width;
    // 设置 Canvas 的宽度和高度为图片的宽度和高度

    const use_image: any = document.getElementById("use_image");
    if (event?.clickType !== "right") {
      let el = event.target;
      const rect = el.getBoundingClientRect();
      let x = event.clientX - rect.left;
      let y = event.clientY - rect.top;
      const dotEle = document.createElement("div");
      dotEle.style.position = "absolute";
      dotEle.style.left = `${x - 5}px`;
      dotEle.style.top = `${y - 5}px`;
      dotEle.style.width = "10px";
      dotEle.style.height = "10px";
      dotEle.style.borderRadius = "50%";
      dotEle.style.backgroundColor = "green";
      dotEle.style.zIndex = "100";
      parentEle.appendChild(dotEle);
    } else {
      let el = event.target;
      const rect = el.getBoundingClientRect();
      let x = event.clientX - rect.left;
      let y = event.clientY - rect.top;
      const dotEle = document.createElement("div");
      dotEle.style.position = "absolute";
      dotEle.style.left = `${x - 5}px`;
      dotEle.style.top = `${y - 5}px`;
      dotEle.style.width = "10px";
      dotEle.style.height = "10px";
      dotEle.style.borderRadius = "50%";
      dotEle.style.zIndex = "100";
      dotEle.style.backgroundColor = "red";
      parentEle.appendChild(dotEle);
    }
  };

  // Get mouse position and scale the (x, y) coordinates back to the natural
  // scale of the image. Update the state of clicks with setClicks to trigger
  // the ONNX model to run and generate a new mask via a useEffect in App.tsx
  const handleMouseMove = _.throttle((e: any) => {
    let el = e.nativeEvent.target;
    canvasDraw(e);
    const rect = el.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    const imageScale = image ? image.width / el.offsetWidth : 1;
    x *= imageScale;
    y *= imageScale;
    const click = getClick(x, y, e.clickType || 1);
    if (click) setClicks([click]);
  }, 15);

  return (
    <div>
      <div>
        <Tool handleMouseMove={handleMouseMove} />
      </div>
    </div>
  );
};

export default Stage;
