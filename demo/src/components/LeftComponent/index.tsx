import React, { useContext } from "react";
import ImageUpload from "../ImageUpload";
import HoverAndClick from "./HoverAndClick";
import CutOuts from "./CutOuts";
import AppContext from "../hooks/createContext";
const LeftComponent = ({
  setLoading = (params: any) => {},
  loading,
  loadFile = (params: any) => {},
}: any) => {
  const {
    maskImgList: [maskImgList, setMaskImgList],
    maskImg: [maskImg],
    showMaskImgList: [showMaskImgList, setShowMaskImgList],
  } = useContext(AppContext)!;
  return (
    <div className="app_left">
      <div className="app_left_content">
        <ImageUpload
          setLoading={setLoading}
          loading={loading}
          loadFile={loadFile}
        />
        {!showMaskImgList && <HoverAndClick />}
        <CutOuts />
      </div>
    </div>
  );
};

export default LeftComponent;
