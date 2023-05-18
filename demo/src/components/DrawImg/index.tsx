import React, { useEffect, useContext } from "react";
import AppContext from "../hooks/createContext";
import { modelInputProps } from "../helpers/Interfaces";

const DrawImg = ({ imgUrl, maskImg }: any) => {
  const {
    clicks: [, setClicks],
    image: [image],
  } = useContext(AppContext)!;

  const getClick = (x: number, y: number, clickType?: any): modelInputProps => {
    return { x, y, clickType: clickType || 1 };
  };

  // useEffect(() => {
  //   const newImage = new Image();
  //   newImage.src = imgUrl;
  //   newImage.onload = function () {
  //     const canvas: any = document.getElementById("draw_image");
  //     const context: any = canvas.getContext("2d");
  //     // 获取图片的宽度和高度
  //     const imageWidth = newImage.width;
  //     const imageHeight = newImage.height;
  //     // 设置 Canvas 的宽度和高度为图片的宽度和高度
  //     canvas.width = imageWidth;
  //     canvas.height = imageHeight;
  //     // 计算图片的缩放比例
  //     // 在 Canvas 上绘制缩放后的图片
  //     context.drawImage(image, 0, 0);
  //     const use_image: any = document.getElementById("use_image");
  //     const scale = use_image.width / imageWidth;
  //     canvas.addEventListener("click", (event: any) => {
  //       let el = event.target;
  //       const rect = el.getBoundingClientRect();
  //       let x = (event.clientX - rect.left) / scale;
  //       let y = (event.clientY - rect.top) / scale;
  //       context.beginPath();
  //       context.arc(x, y, 5 / scale, 0, 2 * Math.PI);
  //       context.fillStyle = "green";
  //       context.fill();
  //     });
  //     canvas.addEventListener("contextmenu", (event: any) => {
  //       event.preventDefault();
  //       let el = event.target;
  //       const rect = el.getBoundingClientRect();
  //       let x = (event.clientX - rect.left) / scale;
  //       let y = (event.clientY - rect.top) / scale;
  //       context.beginPath();
  //       context.arc(x, y, 5 / scale, 0, 2 * Math.PI);
  //       context.fillStyle = "red";
  //       context.fill();
  //     });
  //   };
  // }, []);
  // useEffect(() => {
  //   const newImage = new Image();
  //   newImage.src = imgUrl;
  //   newImage.onload = function () {
  //     const canvas: any = document.getElementById("dot_image");
  //     const context: any = canvas.getContext("2d");
  //     // 获取图片的宽度和高度
  //     const imageWidth = newImage.width;
  //     const imageHeight = newImage.height;
  //     // 设置 Canvas 的宽度和高度为图片的宽度和高度
  //     canvas.width = imageWidth;
  //     canvas.height = imageHeight;
  //     // 计算图片的缩放比例
  //     // 在 Canvas 上绘制缩放后的图片
  //     context.clearRect(0, 0, imageWidth, imageHeight);

  //     // context.drawImage(0, 0, imageWidth, imageHeight);
  //     const use_image: any = document.getElementById("use_image");
  //     const scale = use_image.width / imageWidth;
  //     canvas.addEventListener("click", (event: any) => {
  //       let el = event.target;
  //       const rect = el.getBoundingClientRect();
  //       let x = (event.clientX - rect.left) / scale;
  //       let y = (event.clientY - rect.top) / scale;
  //       context.beginPath();
  //       context.arc(x, y, 5 / scale, 0, 2 * Math.PI);
  //       context.fillStyle = "green";
  //       context.fill();
  //     });
  //     canvas.addEventListener("contextmenu", (event: any) => {
  //       event.preventDefault();
  //       let el = event.target;
  //       const rect = el.getBoundingClientRect();
  //       let x = (event.clientX - rect.left) / scale;
  //       let y = (event.clientY - rect.top) / scale;
  //       context.beginPath();
  //       context.arc(x, y, 5 / scale, 0, 2 * Math.PI);
  //       context.fillStyle = "red";
  //       context.fill();
  //     });
  //   };
  // }, []);

  useEffect(() => {
    if (maskImg) {
      const newImage = new Image();
      newImage.src = maskImg;
      newImage.onload = function () {
        const canvas: any = document.getElementById("mask_image");
        const context: any = canvas.getContext("2d");
        // 获取图片的宽度和高度
        const imageWidth = newImage.width;
        const imageHeight = newImage.height;
        // 设置 Canvas 的宽度和高度为图片的宽度和高度
        canvas.width = imageWidth;
        canvas.height = imageHeight;
        // 计算图片的缩放比例
        // 在 Canvas 上绘制缩放后的图片
        context.drawImage(image, 0, 0);
        const use_image: any = document.getElementById("use_image");
        const scale = use_image.width / imageWidth;
        canvas.addEventListener("click", (event: any) => {
          let el = event.target;
          const rect = el.getBoundingClientRect();
          let x = (event.clientX - rect.left) / scale;
          let y = (event.clientY - rect.top) / scale;
          context.beginPath();
          context.arc(x, y, 5 / scale, 0, 2 * Math.PI);
          context.fillStyle = "green";
          context.fill();
        });
        canvas.addEventListener("contextmenu", (event: any) => {
          event.preventDefault();
          let el = event.target;
          const rect = el.getBoundingClientRect();
          let x = (event.clientX - rect.left) / scale;
          let y = (event.clientY - rect.top) / scale;
          context.beginPath();
          context.arc(x, y, 5 / scale, 0, 2 * Math.PI);
          context.fillStyle = "red";
          context.fill();
        });
      };
    }
  }, [maskImg]);
  return null;
};

export default DrawImg;
