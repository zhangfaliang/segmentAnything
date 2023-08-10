/*
 * @Author: zhao yongfei v-zhaoyongfei@doublefs.com
 * @Date: 2023-08-05 11:03:13
 * @LastEditors: zhao yongfei v-zhaoyongfei@doublefs.com
 * @LastEditTime: 2023-08-08 17:10:40
 * @FilePath: /segmentanything/demo/src/components/hooks/createContext.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// Copyright (c) Meta Platforms, Inc. and affiliates.
// All rights reserved.

// This source code is licensed under the license found in the
// LICENSE file in the root directory of this source tree.

import { createContext } from "react";
import { modelInputProps } from "../helpers/Interfaces";

interface contextProps {
  clicks: [
    clicks: modelInputProps[] | null,
    setClicks: (e: modelInputProps[] | null) => void
  ];
  image: [
    image: HTMLImageElement | null,
    setImage: (e: HTMLImageElement | null) => void
  ];
  huggingImage: [
    huggingImage: HTMLImageElement | null,
    setHuggingImage: (e: HTMLImageElement | null) => void
  ];
  maskImg: [
    maskImg: HTMLImageElement | null,
    setMaskImg: (e: HTMLImageElement | null) => void
  ];
  maskImgList: [maskImgList: Array<any>, setMaskImgList: (e: any) => void];
  showMaskImgList: [
    showMaskImgList: boolean,
    setShowMaskImgList: (e: any) => void
  ];
  previousMask: [previousMask: any | null, setPreviousMask: (e: any) => void];
  loading: [loading: any | null, setLoading: (e: any) => void];
  maskList: [maskList: Array<any>, setMaskList: (e: any) => void];
  huggingImgList: [
    huggingImgList: Array<any>,
    setHuggingImgList: (e: any) => void
  ];
  mergedMask: [mergedMask: Array<any>, setMergedMask: (e: any) => void];
  processImgType: [processImgType: string, setProcessImgType: (e: any) => void];
  localUpLoadImgData: [
    localUpLoadImgData: any | null,
    setLocalUpLoadImgData: (e: any | null) => void
  ];
  globalLoadFile: [
    globalLoadFile: any,
    setGlobalLoadFileLoadFile: (e: any | null) => void
  ];
  rePolling: [rePolling: any, setRePolling: (e: any | null) => void];
  rect: [rect: any, setRect: (e: any | null) => void]
  imageScale: [imageScale: any, setImageScale: (e: any | null) => void]
}

const AppContext = createContext<contextProps | null>(null);

export default AppContext;
