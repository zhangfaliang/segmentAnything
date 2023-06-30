import React, { useContext } from "react";
import AppContext from "../hooks/createContext";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";

const LeftComponent = ({}: any) => {
  const {
    maskImgList: [maskImgList, setMaskImgList],
    maskImg: [maskImg],
    showMaskImgList: [showMaskImgList, setShowMaskImgList],
  } = useContext(AppContext)!;
  const navigate = useNavigate();

  const handleUpload = () => {
    navigate("/upload");
  };
  return (
    <div className="app_left">
      <div className="app_left_content">
        <Button
          variant="contained"
          onClick={handleUpload}
          style={{ height: "40px", width: "80%" }}
        >
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
