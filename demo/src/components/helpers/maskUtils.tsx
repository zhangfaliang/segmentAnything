// Copyright (c) Meta Platforms, Inc. and affiliates.
// All rights reserved.

// This source code is licensed under the license found in the
// LICENSE file in the root directory of this source tree.

// Convert the onnx model mask prediction to ImageData
function arrayToImageData(input: any, width: number, height: number) {
  // const [r, g, b, a] = [0, 114, 189, 255]; // the masks's blue color// the masks's blue color
  const [r, g, b, a] = [0, 0, 0, 255]; // the masks's blue color// the masks's blue color

  const arr = new Uint8ClampedArray(4 * width * height).fill(0);
  for (let i = 0; i < input.length; i++) {
    // Threshold the onnx model mask prediction at 0.0
    // This is equivalent to thresholding the mask using predictor.model.mask_threshold
    // in python
    // 将 onnx 模型掩码预测阈值设为 0.0
    // 这等同于使用 predictor.model.mask_threshold 对掩码进行阈值处理
    if (input[i] > 0.0) {
      // 选中内容
      arr[4 * i + 0] = r;
      arr[4 * i + 1] = g;
      arr[4 * i + 2] = b;
      arr[4 * i + 3] = a;
    } else {
      arr[4 * i] = 255;
      arr[4 * i + 1] = 255;
      arr[4 * i + 2] = 255;
      arr[4 * i + 3] = 255;
    }
    // if (input[i] > 0.0) {
    //   // 中间为白色透明
    //   arr[4 * i + 0] = 255;
    //   arr[4 * i + 1] = 255;
    //   arr[4 * i + 2] = 255;
    //   arr[4 * i + 3] = 0;
    // } else {
    //   // 其他为黑色
    //   arr[4 * i] = 0;
    //   arr[4 * i + 1] = 0;
    //   arr[4 * i + 2] = 0;
    //   arr[4 * i + 3] = 255;
    // }
  }
  return new ImageData(arr, height, width);
}

// Use a Canvas element to produce an image from ImageData
function imageDataToImage(imageData: ImageData) {
  const canvas = imageDataToCanvas(imageData);
  const image = new Image();
  image.src = canvas.toDataURL();
  return image;
}

// Canvas elements can be created from ImageData
function imageDataToCanvas(imageData: ImageData) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "black"; // 设置填充色为黑色
  }

  canvas.width = imageData.width;
  canvas.height = imageData.height;
  ctx?.putImageData(imageData, 0, 0);
  return canvas;
}

// Convert the onnx model mask output to an HTMLImageElement
export function onnxMaskToImage(input: any, width: number, height: number) {
  return imageDataToImage(arrayToImageData(input, width, height));
}
