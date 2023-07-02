import * as React from "react";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import "./index.scss";
export default function CircularColor() {
  return (
    <div className="global_loading_wrapper">
      <CircularProgress color="secondary" />
    </div>
  );
}
