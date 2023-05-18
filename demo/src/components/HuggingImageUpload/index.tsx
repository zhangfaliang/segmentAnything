import ImageUploading from "react-images-uploading";
import React, { useState, useContext, CSSProperties } from "react";
import PacmanLoader from "react-spinners/PacmanLoader";
import "./index.scss";
import { uploadData } from "../../../request/index";
import AppContext from "../hooks/createContext";

export function HuggingImageUpload({
  loadFile,
  setLoading,
  loading,
  showToImgList = true,
  uploadURL = "/save_image",
}: any) {
  const {
    image: [, setImage],
    huggingImage: [, setHuggingImage],
  } = useContext(AppContext)!;
  const [images, setImages] = useState([]);
  let [color, setColor] = useState("#2e432c");
  const maxNumber = 69;
  const uploadImg = async ({ imageList }: any) => {
    const { data_url, file } = imageList[0];
    setLoading(true);
    const { data, message } =
      (await uploadData({
        url: uploadURL,
        data: {
          imgData: data_url.replace("data:image/jpeg;base64,", ""),
          imgName: file.name, //file.name,
          size: file.size,
        },
      })) || {};
    const { error } = data;
    if (error) {
      alert(error);
      setLoading(false);
      return;
    }
    setHuggingImage(data_url);
    loadFile({ data });
    setLoading(false);
  };

  const onChange = (imageList: any, addUpdateIndex: any) => {
    // data for submit
    setImages(imageList);
    if (imageList?.length) {
      uploadImg({ imageList });
    }
  };
  const override: CSSProperties = {
    display: "block",
    margin: "0 auto",
    borderColor: "red",
  };
  const clickToImageList = () => {
    setImage(null);
  };
  return (
    <div className="imageUploading_wrapper">
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

      <ImageUploading
        // multiple
        value={images}
        onChange={onChange}
        maxNumber={maxNumber}
        dataURLKey="data_url"
      >
        {({
          imageList,
          onImageUpload,
          onImageRemoveAll,
          onImageUpdate,
          onImageRemove,
          isDragging,
          dragProps,
        }) => (
          <div className="upload__image-wrapper">
            <button
              style={isDragging ? { color: "red" } : undefined}
              onClick={onImageUpload}
              {...dragProps}
              className="upload__image_btn"
            >
              Click or Drop here
            </button>
            {showToImgList && (
              <a
                style={isDragging ? { color: "red" } : undefined}
                href="/huggingImageList"
                {...dragProps}
                className="upload__image_btn"
              >
                to imageList
              </a>
            )}
          </div>
        )}
      </ImageUploading>
    </div>
  );
}
export default HuggingImageUpload;
