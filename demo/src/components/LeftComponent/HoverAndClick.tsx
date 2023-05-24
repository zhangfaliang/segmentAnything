import React, { useContext, useState } from "react";
import AppContext from "../hooks/createContext";
import "./index.scss";

const HoverAndClick = () => {
  const {
    maskImgList: [maskImgList, setMaskImgList],
    maskImg: [maskImg],
    showMaskImgList: [, setShowMaskImgList],
  } = useContext(AppContext)!;
  const addCutOutObject = () => {
    setMaskImgList([...maskImgList, maskImg?.src]);
    setShowMaskImgList(true);
  };
  const fillColor = "#008334";
  return (
    <div className="hover_and_click_wrapper">
      <div className="hover_and_click_operation">
        <div className="hover_and_click_btn">
          <svg
            width="17"
            height="24"
            viewBox="0 0 17 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-3 mr-2"
          >
            <path
              d="M9.13635 23.8813C8.53843 24.1683 7.82091 23.9172 7.54586 23.3192L4.93889 17.6509L1.93729 20.0665C1.73399 20.2339 1.48286 20.3296 1.19586 20.3296C0.878697 20.3296 0.574526 20.2036 0.350259 19.9793C0.125992 19.7551 0 19.4509 0 19.1337V1.19586C0 0.878697 0.125992 0.574526 0.350259 0.350259C0.574526 0.125992 0.878697 0 1.19586 0C1.48286 0 1.75791 0.107627 1.96121 0.275047L1.97317 0.263089L15.7136 11.7912C16.2278 12.2217 16.2876 12.9751 15.869 13.4773C15.6897 13.6926 15.4385 13.8361 15.1874 13.8839L11.4085 14.6253L14.0394 20.2817C14.3503 20.8797 14.0633 21.5852 13.4654 21.8603L9.13635 23.8813Z"
              fill={fillColor}
            ></path>
          </svg>
          <span className="font-bold ">使用点击方式生成mask</span>
        </div>
        <p className="hover_and_click_desc">
          左击击一个对象一次或多次。右击键单击以删除区域。
        </p>
        <div className="flex flex-col gap-3 py-3 pl-3 text-sm bg-gray-200 cursor-pointer rounded-xl bg-gradient-to-r from-gray-200 to-blue-400/30 background-animate false">
          <button className="flex opacity-70">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="1"
                y="1"
                width="12"
                height="12"
                rx="2"
                fill={fillColor}
                stroke={fillColor}
                stroke-width="2"
              ></rect>
              <rect
                x="4"
                y="4"
                width="12"
                height="12"
                rx="2"
                fill={fillColor}
                stroke={fillColor}
                stroke-width="2"
              ></rect>
              <rect
                x="7"
                y="7"
                width="12"
                height="12"
                rx="2"
                fill={fillColor}
                stroke={fillColor}
                stroke-width="2"
              ></rect>
            </svg>
            <span className="pl-2 opacity-70 font-bold false">遮罩列表</span>
          </button>
          <button onClick={addCutOutObject} className="flex false ">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M11.7895 0H13.4737V2.52632H16V4.21053H13.4737V6.73684H11.7895V4.21053H9.26316V2.52632H11.7895V0ZM3.36842 2.52632H6.73684V4.21053H3.36842C2.44211 4.21053 1.68421 4.96842 1.68421 5.89474V12.6316C1.68421 13.5663 2.44211 14.3158 3.36842 14.3158H10.1053C11.04 14.3158 11.7895 13.5663 11.7895 12.6316V9.26316H13.4737V12.6316C13.4737 14.4926 11.9663 16 10.1053 16H3.36842C1.50737 16 0 14.4926 0 12.6316V5.89474C0 4.03368 1.50737 2.52632 3.36842 2.52632Z"
                fill={fillColor}
              ></path>
            </svg>
            <span className="pl-2 opacity-70">保存mask</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HoverAndClick;
