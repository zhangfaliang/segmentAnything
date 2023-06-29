import React, { useContext } from "react";
import AppContext from "../hooks/createContext";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import Button from "@mui/material/Button";

const LeftComponent = ({}: any) => {
  const {
    maskImgList: [maskImgList, setMaskImgList],
    maskImg: [maskImg],
    showMaskImgList: [showMaskImgList, setShowMaskImgList],
  } = useContext(AppContext)!;
  return (
    <div className="app_left">
      <div className="app_left_content">
        <Button variant="contained" style={{ height: "40px", width: "80%" }}>
          <CloudUploadIcon
            style={{
              display: "block",
              marginRight: "3px",
            }}
          ></CloudUploadIcon>
          上传照片
        </Button>
      </div>
    </div>
  );
};

export default LeftComponent;
