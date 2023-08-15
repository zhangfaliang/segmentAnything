import { InferenceSession, Tensor } from "onnxruntime-web";
import React, { useContext, useEffect, useState } from "react";
import "./assets/scss/App.scss";
import { handleImageScale } from "./components/helpers/scaleHelper";
import { modelScaleProps } from "./components/helpers/Interfaces";
import { onnxMaskToImage } from "./components/helpers/maskUtils";
import { modelData } from "./components/helpers/onnxModelAPI";
import Stage from "./components/Stage";
import AppContext from "./components/hooks/createContext";

// import LeftComponent from "./components/LeftComponent/index.next";
// import LeftComponent from "./components/LeftComponent";

const ort = require("onnxruntime-web");
/* @ts-ignore */
import npyjs from "npyjs";

const App = ({}: any) => {
  const {
    clicks: [clicks],
    image: [image, setImage],
    maskImg: [, setMaskImg],
    loading: [loading, setLoading],
    previousMask: [previousMask, setPreviousMask],
    mergedMask: [mergedMask, setMergedMask],
    localUpLoadImgData: [localUpLoadImgData],
  } = useContext(AppContext)!;

  const [model, setModel] = useState<InferenceSession | null>(null); // ONNX model
  const [tensor, setTensor] = useState<Tensor | null>(null); // Image embedding tensor
  const [modelScale, setModelScale] = useState<modelScaleProps | null>(null);

  const loadFile = async ({ imgURL, npyURL, onnxURL }: any) => {
    setLoading(true);
    try {
      const img = new Image();
      img.src = imgURL.href;

      img.onload = () => {
        const { height, width, samScale } = handleImageScale(img);
        setModelScale({
          height: height, // original image height
          width: width, // original image width
          samScale: samScale, // scaling factor for image which has been resized to longest side 1024
        });
        img.width = width;
        img.height = height;
        setImage(img);
      };
      setMaskImg(null);
      setPreviousMask("");
      setMergedMask("");

      await Promise.resolve(loadNpyTensor(npyURL, "float32")).then(
        (embedding) => setTensor(embedding)
      );
      const initModel = async () => {
        try {
          if (onnxURL === undefined) return;
          const URL: string = onnxURL;
          const model = await InferenceSession.create(URL);
          setModel(model);
          setLoading(false);
        } catch (e) {
          console.log(e);
        }
      };
      initModel();
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  // Decode a Numpy file into a tensor.
  const loadNpyTensor = async (tensorFile: string, dType: string) => {
    let npLoader = new npyjs();

    const npArray = await npLoader.load(tensorFile);
    const tensor = new ort.Tensor(dType, npArray.data, npArray.shape);
    return tensor;
  };

  // Run the ONNX model every time clicks has changed
  useEffect(() => {
    runONNX();
  }, [clicks]);

  const mergeMasks = (
    previousMask: any,
    currentMask: any,
    height: any,
    width: any
  ) => {
    if (!previousMask) {
      // 如果上次的掩码为空，则直接返回当前的掩码
      return currentMask;
    }

    const mergedMask = new Uint8ClampedArray(height * width);

    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        const index = i * width + j;
        mergedMask[index] = Math.max(
          previousMask[index],
          currentMask[index] * 255
        );
      }
    }

    return mergedMask;
  };

  const removeIntersectingMasks = (
    previousMask: any,
    currentMask: any,
    height: any,
    width: any
  ) => {
    if (!previousMask) {
      // 如果上次的掩码为空，则直接返回当前的掩码
      return currentMask;
    }

    const removedMask = new Uint8ClampedArray(height * width);

    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        const index = i * width + j;
        // 检查当前像素位置的掩码是否与上次的掩码存在交集
        if (currentMask[index] > 0) {
          removedMask[index] = 0; // 移除交集的掩码
        } else {
          removedMask[index] = Math.max(
            previousMask[index],
            currentMask[index] * 255
          );
        }
      }
    }

    return removedMask;
  };

  const runONNX = async () => {
    try {
      if (
        model === null ||
        clicks === null ||
        tensor === null ||
        modelScale === null
      )
        return;
      else {
        //首先检查模型、输入数据和模型比例是否都不为空，
        // 如果为空则返回。如果不为空，则调用onnxModelAPI.tsx文件中的modelData()
        let feeds: any = modelData({
          clicks,
          tensor,
          modelScale,
        });

        if (feeds === undefined) return;
        // 使用从 modelData() 返回的数据进行 SAM ONNX 模型的运行
        const results = await model.run(feeds);
        const output = results[model.outputNames[0]];
        const lastClick = clicks[clicks.length - 1];

        if (lastClick.clickType !== "right") {
          // 将上次的掩码与最新的掩码合并
          const mergedOutput = mergeMasks(
            previousMask,
            output.data,
            output.dims[2],
            output.dims[3]
          );
          const mask = onnxMaskToImage(
            mergedOutput,
            output.dims[2],
            output.dims[3],
            []
          );
          // 将合并后的掩码转换为图像，并设置为 mergedMask 状态
          setMergedMask(mask);
          // 将最新的输出掩码设置为 maskImg 状态
          setMaskImg(mask);
          // 更新上次的掩码为最新的输出掩码
          setPreviousMask(mergedOutput);
          // setPreviousMask(mergedOutput);
        } else {
          // 如果是右击，则去除相应的掩码
          const mergedOutput = removeIntersectingMasks(
            previousMask,
            output.data,
            output.dims[2],
            output.dims[3]
          );
          const mask = onnxMaskToImage(
            mergedOutput,
            output.dims[2],
            output.dims[3],
            []
          );
          // 将合并后的掩码转换为图像，并设置为 mergedMask 状态
          setMergedMask(mask);

          // 将最新的输出掩码设置为 maskImg 状态
          setMaskImg(mask);
          setPreviousMask(mergedOutput);
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="app_wrapper">
      <div className="app_right">{image && <Stage loadFile={loadFile} />}</div>
    </div>
  );
};

export default App;
