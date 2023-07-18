import React, { useContext, useEffect } from "react";
import AppContext from "../hooks/createContext";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import Typography from "@mui/material/Typography";
import LinearProgress, {
  LinearProgressProps,
} from "@mui/material/LinearProgress";
import Box from "@mui/material/Box";
import { get } from "lodash";
import Polling from "../../utils/Polling";
import { getData } from "../../../request/index";

let duration = 5000;
let polling = new Polling({ duration });
function LinearProgressWithLabel(
  props: LinearProgressProps & { value: number }
) {
  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Box sx={{ width: "100%", mr: 1 }}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="text.secondary">{`${Math.round(
          props.value
        )}%`}</Typography>
      </Box>
    </Box>
  );
}

const LeftComponent = ({}: any) => {
  const {
    rePolling: [rePolling],
  } = useContext(AppContext)!;
  const navigate = useNavigate();
  const [taskData, setTaskData]: any = React.useState({});

  const [progress, setProgress] = React.useState(10);

  const handleUpload = () => {
    navigate("/upload");
  };
  const pageRequestData = async () => {
    const res = await getData({ url: `/get/maskTask`, isNodeServer: true });
    return res;
  };
  const apiCallback = (res: any) => {
    processRes(res);
  };

  const processRes = (res: any) => {
    setTaskData(res?.data);
    if (res?.data?.queueNumber > 0) {
      const data = {
        "5": 17,
        "4": 34,
        "3": 51,
        "2": 68,
        "1": 85,
        "0": 100,
      };
      setProgress(get(data, res?.data?.queueNumber, ""));
    }
  };
  const startPolling = ({ reStart }: any) => {
    if (reStart) {
      polling.stopPolling();
      polling = new Polling({ duration });
    }
    polling.startPolling({
      apiFn: pageRequestData,
      apiArgs: {},
      apiCallback: apiCallback,
    });
  };
  useEffect(() => {
    polling.stopPolling();
    startPolling({ reStart: true });
    return () => {
      polling.stopPolling();
    };
  }, []);
  useEffect(() => {
    if (rePolling) {
      polling.stopPolling();
      startPolling({ reStart: true });
      return () => {
        polling.stopPolling();
      };
    }
  }, [rePolling]);

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
          上传图片
        </Button>
        <Box mt={4} sx={{ width: "100%" }}>
          <Typography variant="button" display="block" gutterBottom>
            {taskData?.desc}
            {!!taskData?.queueNumber && (
              <LinearProgressWithLabel value={progress} />
            )}
          </Typography>
        </Box>
      </div>
    </div>
  );
};

export default LeftComponent;
