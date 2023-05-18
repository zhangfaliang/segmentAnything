import React, { useContext, useState } from "react";
import AppContext from "../hooks/createContext";
import { get } from "lodash";
import "./index.scss";

const fillColor = "#008334";

const CutOuts = () => {
  const {
    maskImgList: [maskImgList],
    showMaskImgList: [showMaskImgList, setShowMaskImgList],
  } = useContext(AppContext)!;
  const handleCloseCut = () => {
    setShowMaskImgList(false);
  };
  const clickOpenCut = () => {
    setShowMaskImgList(true);
  };
  const wrapperClassName = showMaskImgList
    ? "active_border"
    : "outline-gray-100";
  return (
    <div
      className={`hover_and_click_maskList_wrapper transition-all overflow-hidden my-2 rounded-xl px-4 py-2 cursor-pointer  ${wrapperClassName}`}
    >
      <div className="flex max-h-[40px]">
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          className="mt-1"
        >
          <path
            d="M10.575 6.3C10.575 5.175 11.0812 4.5 11.925 4.5C12.7687 4.5 13.275 5.175 13.275 6.3C13.275 7.425 12.7687 8.1 11.925 8.1C11.0812 8.1 10.575 7.425 10.575 6.3Z"
            fill={fillColor}
          ></path>
          <path
            d="M6.075 4.5C5.23125 4.5 4.725 5.175 4.725 6.3C4.725 7.425 5.23125 8.1 6.075 8.1C6.91875 8.1 7.425 7.425 7.425 6.3C7.425 5.175 6.91875 4.5 6.075 4.5Z"
            fill={fillColor}
          ></path>
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M18 10.2088V3.6C18 1.61177 16.3882 0 14.4 0H3.6C1.61177 0 0 1.61177 0 3.6V14.4C0 16.3882 1.61177 18 3.6 18H10.2088C11.1636 18 12.0793 17.6207 12.7544 16.9456L16.9456 12.7544C17.6207 12.0793 18 11.1636 18 10.2088ZM3.6 2.25H14.4C15.1456 2.25 15.75 2.85442 15.75 3.6V8.75C15.75 8.88807 15.6381 9 15.5 9H12.6C10.8656 9 9.4177 10.2265 9.07625 11.8594C9.06866 11.8957 9.03707 11.9225 8.99998 11.9225C7.65188 11.9225 6.41916 11.4285 5.47297 10.6116C5.07293 10.2662 4.45995 10.2265 4.08625 10.6001C3.75946 10.9269 3.73435 11.4546 4.07118 11.771C5.3028 12.928 6.94175 13.6565 8.74991 13.7182C8.8879 13.7229 8.99998 13.8344 8.99998 13.9725L9 15.5C9 15.6381 8.88807 15.75 8.75 15.75H3.6C2.85442 15.75 2.25 15.1456 2.25 14.4V3.6C2.25 2.85442 2.85442 2.25 3.6 2.25Z"
            fill={fillColor}
          ></path>
        </svg>
        <span onClick={clickOpenCut} className="pl-2 font-bold false">
          Cut-Outs
        </span>
        {showMaskImgList && (
          <button onClick={handleCloseCut} className="ml-auto font-bold">
            Close
          </button>
        )}
      </div>

      {showMaskImgList && (
        <div className="hover_and_click_maskList">
          <p className="my-1 text-xs ">See Cut-outs</p>
          {!!get(maskImgList, "length") &&
            maskImgList?.map((item) => {
              return <img src={item} alt="" />;
            })}
        </div>
      )}
    </div>
  );
};
export default CutOuts;
