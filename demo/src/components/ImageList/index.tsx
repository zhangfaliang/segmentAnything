import React, { useEffect, useState, useContext } from "react";
import { isEmpty, get } from "lodash";
import { getData } from "../../../request/index";
import "./index.scss";
import { postData } from "../../../request/index";
import AppContext from "../../components/hooks/createContext";

const ImageList = ({ loadFile = (params: any) => {} }) => {
  const {
    loading: [, setLoading],
    maskImg: [, setMaskImg],
    previousMask: [previousMask, setPreviousMask],
    mergedMask: [mergedMask, setMergedMask],
  } = useContext(AppContext)!;
  const [imgList, setImgList] = useState([]);
  const [deleteFlag, setDeleteFlag] = useState(true);

  const getImgList = async () => {
    const res = await getData({ url: "/api/files" });
    if (!isEmpty(res)) {
      const imgDataList: any = [];
      const { image_paths, onnx_paths, npy_paths }: any = res || {};
      if (!isEmpty(image_paths)) {
        image_paths.forEach((item: any) => {
          let npy = "";
          let onnx = "";
          const pathArr = item.split("/");
          const fileName = (pathArr[pathArr.length - 1] || "").replace(
            /.(png|jpg|jpeg|webp|gif)/,
            ""
          );

          let reg = new RegExp(`${fileName}`, "g");
          if (!isEmpty(onnx_paths)) {
            onnx = onnx_paths.find((item: any) => reg.test(item)) || "";
          }
          console.log(item, reg.test(item), reg, "fileNamefileName");
          if (!isEmpty(npy_paths)) {
            npy = npy_paths.find((item: any) => reg.test(item) || "");
          }

          if (npy && onnx) {
            imgDataList.push({
              imgURL: item.replace("demo/src", ""),
              npyURL: npy.replace("demo/src", ""),
              onnxURL: onnx.replace("demo", ""),
            });
          }
          if (!isEmpty(imgDataList)) {
            setImgList(imgDataList);
            if (imgDataList.length >= 2) {
              setDeleteFlag(true);
            } else {
              setDeleteFlag(false);
            }
          }
        });
      }
    }
  };
  useEffect(() => {
    getImgList();
  }, []);
  const clickDele = async ({ imgURL, npyURL, onnxURL }: any) => {
    setLoading(true);
    const pathArr = imgURL.split("/");
    const name = get(pathArr, pathArr.length - 1, "").replace(/\.\D+|\d+$/, "");
    await postData({ url: "/delete", data: { name } });
    await getImgList();
    setLoading(false);

    // loadFile({ imgURL, npyURL, onnxURL });
  };
  const clickUser = ({ imgURL, npyURL, onnxURL }: any) => {
    setMaskImg(null);
    setPreviousMask("");
    setMergedMask("");
    const url = new URL(imgURL, location.origin);
    loadFile({ imgURL: url, npyURL, onnxURL });
  };
  return (
    <div className="imgList_wrapper">
      {!!imgList?.length &&
        imgList.map(({ imgURL, npyURL, onnxURL, mask }: any) => {
          return (
            <div key={imgURL} className="img_item_wrapper">
              <img
                className="img_item"
                src={imgURL || `data:image/webp;base64,${mask}`}
                alt=""
              />
              <div className="img_item_btn">
                <span
                  onClick={() => {
                    clickUser({ imgURL, npyURL, onnxURL });
                  }}
                  className="img_item_use"
                >
                  使用
                </span>{" "}
                {deleteFlag && (
                  <span
                    onClick={() => {
                      clickDele({
                        imgURL: `demo/src${imgURL}`,
                        npyURL: `demo/src${npyURL}`,
                        onnxURL: `demo/${onnxURL}`,
                      });
                    }}
                    className="img_item_del"
                  >
                    {deleteFlag && "删除"}
                  </span>
                )}
              </div>
            </div>
          );
        })}
    </div>
  );
};
export default ImageList;
