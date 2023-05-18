// 版权所有 Meta Platforms, Inc. 及其附属公司。
// 保留所有权利。

// 此源代码的许可证包含在源代码根目录中的 LICENSE 文件中。

// 该文件没有实际代码，只是版权声明。

import { Tensor } from "onnxruntime-web";
import { modeDataProps } from "./Interfaces";

const modelData = ({ clicks, tensor, modelScale }: modeDataProps) => {
  const imageEmbedding = tensor;
  let pointCoords;
  let pointLabels;
  let pointCoordsTensor;
  let pointLabelsTensor;

  // 检查是否有输入的点击提示
  if (clicks) {
    let n = clicks.length;
    // 如果没有边框输入，则应该连接带有标签-1和坐标（0.0，0.0）的单个填充点
    // 因此初始化数组以支持（n + 1）个点。
    pointCoords = new Float32Array(2 * (n + 1));
    pointLabels = new Float32Array(n + 1);
    // 添加点击和缩放到SAM期望的内容
    for (let i = 0; i < n; i++) {
      pointCoords[2 * i] = clicks[i].x * modelScale.samScale;
      pointCoords[2 * i + 1] = clicks[i].y * modelScale.samScale;
      pointLabels[i] = clicks[i].clickType;
    }
    //在只有点击信息而没有包含矩形框信息的情况下，需要添加一个额外的点和标签，该点位于坐标 (0, 0)，标签为 -1。
    pointCoords[2 * n] = 0.0;
    pointCoords[2 * n + 1] = 0.0;
    pointLabels[n] = -1.0;

    // Create the tensor
    // 创建张量
    pointCoordsTensor = new Tensor("float32", pointCoords, [1, n + 1, 2]);
    pointLabelsTensor = new Tensor("float32", pointLabels, [1, n + 1]);
  }
  const imageSizeTensor = new Tensor("float32", [
    modelScale.height,
    modelScale.width,
  ]);

  if (pointCoordsTensor === undefined || pointLabelsTensor === undefined)
    return;

  // There is no previous mask, so default to an empty tensor
  // 没有之前的mask，因此将其默认为空张量

  const maskInput = new Tensor(
    "float32",
    new Float32Array(256 * 256),
    [1, 1, 256, 256]
  );
  //   在这个例子中，[1, 1, 256, 256] 是描述张量形状的数组，其中每个元素表示张量的维度大小。在这个例子中，张量是一个四维张量，具有以下形状：

  // 第一维大小为1，表示张量只有一个示例（即batch size = 1）。
  // 第二维大小为1，表示张量只有一个通道。
  // 第三维大小为256，表示张量的高度为256个像素。
  // 第四维大小为256，表示张量的宽度为256个像素。
  // 因此，这个张量可以表示一个256x256像素的灰度图像。每个像素用一个浮点数来表示，初始值为0.0。

  // There is no previous mask, so default to 0
  //这段代码的注释是在描述一个名为hasMaskInput的Tensor对象的初始化。
  //由于没有先前的遮罩，因此该Tensor被初始化为包含单个值0的标量张量。

  const hasMaskInput = new Tensor("float32", [0]);

  return {
    image_embeddings: imageEmbedding, //
    point_coords: pointCoordsTensor,
    point_labels: pointLabelsTensor,
    orig_im_size: imageSizeTensor,
    mask_input: maskInput,
    has_mask_input: hasMaskInput,
  };
};

export { modelData };
