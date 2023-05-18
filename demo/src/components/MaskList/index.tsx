import React, { useEffect, useState, useContext } from "react";
import { isEmpty, get } from "lodash";
import { getData } from "../../../request/index";
import "./index.scss";
import { postData } from "../../../request/index";
import AppContext from "../hooks/createContext";

const MaskList = ({}) => {
  const {
    maskList: [maskList],
  } = useContext(AppContext)!;

  return (
    <div className="imgList_wrapper">
      {!!maskList?.length &&
        maskList.map(({ label, mask }: any) => {
          return (
            <div key={mask} className="img_item_wrapper">
              <img
                className="img_item"
                src={`data:image/webp;base64,${mask}`}
                alt=""
              />
              <div className="img_item_btn">
                <span className="img_item_tag">{label}</span>
                <a
                  href={`data:image/webp;base64,${mask}`}
                  download={`${label}-image.jpg`}
                  className="img_item_use"
                >
                  下载
                </a>
              </div>
            </div>
          );
        })}
    </div>
  );
};
export default MaskList;
