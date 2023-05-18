import React, { useEffect, useState, useContext } from "react";
import { isEmpty, get } from "lodash";
import { useNavigate } from "react-router-dom";

import { getData } from "../../../request/index";
import "./index.scss";
import { postData } from "../../../request/index";
import AppContext from "../hooks/createContext";
import PacmanLoader from "react-spinners/PacmanLoader";

const HuggingImageList = ({ loadFile = (params: any) => {}, history }: any) => {
  const {
    loading: [loading, setLoading],
    huggingImgList: [huggingImgList, setHuggingImgList],
    maskList: [, setMaskList],
    huggingImage: [, setHuggingImage],
  } = useContext(AppContext)!;
  const [deleteFlag, setDeleteFlag] = useState(true);
  let navigate = useNavigate();

  const getImgList = async () => {
    const res = await getData({ url: "/api/hugging_files" });
    if (!isEmpty(res)) {
      const { image_paths }: any = res || {};

      if (!isEmpty(image_paths)) {
        image_paths.forEach((item: any) => {
          const pathArr = item.split("/");
          const fileName = (pathArr[pathArr.length - 1] || "").replace(
            /.(png|jpg|jpeg|webp|gif)/,
            ""
          );
          let reg = new RegExp(`${fileName}`, "g");

          if (!isEmpty(image_paths)) {
            setHuggingImgList(image_paths);
          }
        });
      }
    }
  };
  useEffect(() => {
    getImgList();
  }, []);
  const clickDele = async ({ imgURL }: any) => {
    setLoading(true);
    const pathArr = imgURL.split("/");
    await postData({ url: "/hugging_delete", data: { img_path: imgURL } });
    await getImgList();
    setLoading(false);
  };
  const clickUser = async ({ imgURL }: any) => {
    setLoading(true);
    const { data } =
      (await postData({
        url: "/hugging_face_use_image",
        data: { imgURL },
      })) || {};

    try {
      setMaskList(data);
      setHuggingImage(imgURL.replace("demo/src/", ""));
      setLoading(false);
      navigate("/");
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };
  const override = {
    display: "block",
    margin: "0 auto",
    borderColor: "red",
  };
  let [color, setColor] = useState("#2e432c");
  return (
    <div className="imgList_wrapper">
      {loading && (
        <div className="imageUp_loading_true">
          <PacmanLoader
            size={40}
            color={color}
            loading={loading}
            cssOverride={override}
            aria-label="Loading Spinner"
            data-testid="loader"
            speedMultiplier={1}
          />
        </div>
      )}

      {!!huggingImgList?.length &&
        huggingImgList.map((item: any) => {
          return (
            <div key={item} className="img_item_wrapper">
              <img
                className="img_item"
                src={item.replace("demo/src/", "")}
                alt=""
              />
              <div className="img_item_btn">
                <span
                  onClick={() => {
                    clickUser({ imgURL: item });
                  }}
                  className="img_item_use"
                >
                  使用
                </span>{" "}
                <span
                  onClick={() => {
                    clickDele({
                      imgURL: item,
                    });
                  }}
                  className="img_item_del"
                >
                  {deleteFlag && "删除"}
                </span>
              </div>
            </div>
          );
        })}
    </div>
  );
};
export default HuggingImageList;
