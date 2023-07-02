import React, { useEffect, useState, useContext } from "react";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import ImageListItemBar from "@mui/material/ImageListItemBar";
import IconButton from "@mui/material/IconButton";
import { isEmpty, get } from "lodash";
import { getData } from "../../../request/index";
import { postData } from "../../../request/index";
import AppContext from "../../components/hooks/createContext";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteImgModal from "./DeleteImgModal";

export default function TitlebarImageList({}: any) {
  const {
    loading: [, setLoading],
    maskImg: [, setMaskImg],
    previousMask: [previousMask, setPreviousMask],
    mergedMask: [mergedMask, setMergedMask],
    globalLoadFile: [globalLoadFile, setGlobalLoadFileLoadFile],
  } = useContext(AppContext)!;

  const [imgList, setImgList] = useState([]);
  const [deleteFlag, setDeleteFlag] = useState(true);
  const [open, setOpen]: any = React.useState(false);
  const [deleteData, setDeleteData]: any = React.useState({});

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
          if (!isEmpty(npy_paths)) {
            npy = npy_paths.find((item: any) => reg.test(item) || "");
          }

          if (npy && onnx) {
            const imgURL = item.replace("demo/src", "");
            const order = get(
              imgURL.match(/@_@(\d+)\.(jpg|png|jpeg|webp)/),
              "1",
              0
            );
            console.log(imgURL, "itemitemitem");

            imgDataList.push({
              imgURL,
              npyURL: npy.replace("demo/src", ""),
              onnxURL: onnx.replace("demo", ""),
              img: item.replace("demo/src", ""),
              title: item,
              author: "@halara",
              // rows: 2,
              // cols: 2,
              featured: true,
              order: order,
            });
          }
          imgDataList.sort((a: any, b: any) => {
            return b.order - a.order;
          });
          if (!isEmpty(imgDataList)) {
            imgDataList.map((item: any) => {});

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
  const handleDelete = async () => {
    if (!deleteData?.imgURL) return;
    setLoading(true);

    const pathArr = deleteData?.imgURL?.split("/");
    const name = get(pathArr, pathArr.length - 1, "").replace(/\.\D+|\d+$/, "");
    await postData({ url: "/delete", data: { name } });
    await getImgList();
    setLoading(false);
    setOpen(false);
  };
  const clickDele = async ({ imgURL, npyURL, onnxURL }: any) => {
    setDeleteData({
      imgURL,
      npyURL,
      onnxURL,
    });
    setOpen(true);
  };
  const clickUser = async ({ imgURL, npyURL, onnxURL }: any) => {
    setMaskImg(null);
    setPreviousMask("");
    setMergedMask("");
    const url = new URL(imgURL, location.origin);
    (window as any).loadFile({ imgURL: url, npyURL, onnxURL });
  };
  const [files, setFiles]: any = useState([]);

  return (
    <>
      <DeleteImgModal open={open} setOpen={setOpen} handleYes={handleDelete} />
      <ImageList
        sx={{
          width: "100%",
          height: "auto",
          overflowY: "scroll",
        }}
        rowHeight={"auto"}
        cols={6}
        gap={16}
      >
        {imgList.map((item: any) => (
          <ImageListItem
            key={item.img}
            classes="imgList_item_wrapper"
            onClick={() => clickUser(item)}
            style={{
              cursor: "pointer",
            }}
          >
            <img
              style={{
                cursor: "pointer",
              }}
              src={`${item.img}?w=248&fit=crop&auto=format`}
              srcSet={`${item.img}?w=248&fit=crop&auto=format&dpr=2 2x`}
              alt={item.title}
              loading="lazy"
              // className="lazyload"
            />
            <ImageListItemBar
              // title={item.title}
              subtitle={item.author}
              actionIcon={
                <IconButton
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    deleteFlag && clickDele(item);
                  }}
                  sx={{ color: "rgba(255, 255, 255, 0.54)" }}
                  aria-label={`info about ${item.title}`}
                >
                  {deleteFlag && <DeleteIcon>删除</DeleteIcon>}
                </IconButton>
              }
            />
          </ImageListItem>
        ))}
      </ImageList>
    </>
  );
}
