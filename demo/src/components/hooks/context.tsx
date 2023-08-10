// Copyright (c) Meta Platforms, Inc. and affiliates.
// All rights reserved.

// This source code is licensed under the license found in the
// LICENSE file in the root directory of this source tree.

import React, { useState } from "react";
import { modelInputProps } from "../helpers/Interfaces";
import AppContext from "./createContext";

const AppContextProvider = (props: {
  children: React.ReactElement<any, string | React.JSXElementConstructor<any>>;
}) => {
  const [clicks, setClicks] = useState<Array<modelInputProps> | null>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [maskImg, setMaskImg] = useState<HTMLImageElement | null>(null);
  const [maskImgList, setMaskImgList] = useState<any>([]);
  const [showMaskImgList, setShowMaskImgList] = useState<any>(false);
  const [previousMask, setPreviousMask] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [maskList, setMaskList] = useState<any>([]);
  const [huggingImage, setHuggingImage] = useState<any>([]);
  const [huggingImgList, setHuggingImgList] = useState<any>([]);
  const [mergedMask, setMergedMask] = useState<any>(null);
  const [processImgType, setProcessImgType] = useState<any>("mask");
  const [localUpLoadImgData, setLocalUpLoadImgData] = useState<any | null>(
    null
  );
  const [globalLoadFile, setGlobalLoadFileLoadFile] = useState<any | null>(
    () => {}
  );
  const [rePolling, setRePolling] = useState<any | null>(() => {});
  const [rect, setRect] = useState({x: 0, y: 0, w: 0, h: 0})
  const [imageScale, setImageScale] = useState(0)
  return (
    <AppContext.Provider
      value={{
        clicks: [clicks, setClicks],
        image: [image, setImage],
        huggingImage: [huggingImage, setHuggingImage],
        maskImg: [maskImg, setMaskImg],
        maskImgList: [maskImgList, setMaskImgList],
        showMaskImgList: [showMaskImgList, setShowMaskImgList],
        previousMask: [previousMask, setPreviousMask],
        loading: [loading, setLoading],
        maskList: [maskList, setMaskList],
        huggingImgList: [huggingImgList, setHuggingImgList],
        mergedMask: [mergedMask, setMergedMask],
        processImgType: [processImgType, setProcessImgType],
        localUpLoadImgData: [localUpLoadImgData, setLocalUpLoadImgData],
        globalLoadFile: [globalLoadFile, setGlobalLoadFileLoadFile],
        rePolling: [rePolling, setRePolling],
        rect: [rect, setRect],
        imageScale: [imageScale, setImageScale]
      }}
    >
      {props.children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
