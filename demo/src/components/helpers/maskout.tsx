const MaskOut = ({ base64Img }: any) => {
  // 创建一个 Image 对象
  var img = new Image();
  // 设置图像对象的 src 属性，将 base64 数据赋值给 src
  img.src = base64Img;
  // 图像加载完成后执行回调函数
  img.onload = function () {
    // 创建一个 canvas 元素
    var canvas = document.createElement("canvas");
    // 设置画布的宽度和高度
    canvas.width = img.width;
    canvas.height = img.height;

    // 获取画布上下文对象
    var context: any = canvas.getContext("2d");

    // 将图像对象绘制到画布上
    context.drawImage(img, 0, 0);

    // 获取画布上每个像素点的颜色值
    var imageData = context.getImageData(0, 0, img.width, img.height);
    var pixelData = imageData.data;

    // 将颜色值转换成遮罩对象
    var mask = [];
    for (var i = 0; i < pixelData.length; i += 4) {
      var r = pixelData[i];
      var g = pixelData[i + 1];
      var b = pixelData[i + 2];
      var a = pixelData[i + 3];
      var alpha = a / 255;
      var luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      mask.push(luminance * alpha);
    }

    // 将遮罩对象转换成图像对象
    var maskImageData = context.createImageData(img.width, img.height);
    var maskPixelData = maskImageData.data;
    for (var i = 0; i < maskPixelData.length; i += 4) {
      var alpha = Math.round(mask[i / 4] * 255);
      maskPixelData[i] = 255;
      maskPixelData[i + 1] = 255;
      maskPixelData[i + 2] = 255;
      maskPixelData[i + 3] = alpha;
    }

    // 将遮罩对象绘制到画布上
    context.putImageData(maskImageData, 0, 0);

    // 将画布转换成 PNG 图片，并保存到本地文件
    var downloadLink = document.createElement("a");
    downloadLink.href = canvas.toDataURL("image/png");
    downloadLink.download = "mask.png";
    downloadLink.click();
  };
};

export default MaskOut;
