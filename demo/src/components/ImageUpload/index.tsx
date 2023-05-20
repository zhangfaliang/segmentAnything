import ImageUploading from "react-images-uploading";
import React, { useState, useContext, CSSProperties, useEffect } from "react";
import PacmanLoader from "react-spinners/PacmanLoader";
import "./index.scss";
import { uploadData } from "../../../request/index";
import AppContext from "../hooks/createContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function ImageUpload({
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
    const { data, code, message } =
      (await uploadData({
        url: uploadURL,
        data: {
          imgData: data_url.replace("data:image/jpeg;base64,", ""),
          imgName: file.name, //file.name,
          size: file.size,
        },
      })) || {};

    if (code === -1) {
      toast(`🔐--${message}`, {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
    }
    const { imgURL, npyURL, onnxURL } = data;
    const url = new URL(imgURL, location.origin);
    loadFile({ imgURL: url, npyURL, onnxURL, data });
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
      <ToastContainer />
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
            {/* {images?.length ? (
              <button onClick={onImageRemoveAll}>Remove all images</button>
            ) : (
             
            )} */}
            <button
              style={isDragging ? { color: "red" } : undefined}
              onClick={onImageUpload}
              {...dragProps}
              className="upload__image_btn"
            >
              Click or Drop here
            </button>
            {showToImgList && (
              <button
                style={isDragging ? { color: "red" } : undefined}
                onClick={clickToImageList}
                {...dragProps}
                className="upload__image_btn"
              >
                to imageList
              </button>
            )}
          </div>
        )}
      </ImageUploading>
    </div>
  );
}
export default ImageUpload;
