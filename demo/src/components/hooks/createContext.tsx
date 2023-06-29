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
}

const AppContext = createContext<contextProps | null>(null);

export default AppContext;
