import * as React from "react";
import { createRoot } from "react-dom/client";
import AppContextProvider from "./components/hooks/context";
import "react-image-crop/dist/ReactCrop.css";
import AppBar from "./components/AppBar";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import ImageUpload from "./components/ImageUpload/index.next";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import SAM from "./SAM";
import LeftComponent from "./components/LeftComponent/index";
import ImageList from "./components/ImageList/index.next";
import "./assets/scss/App.scss";
import Crop from "./page/crop";
import Stage from "./components/Stage";

const container = document.getElementById("root");
const root = createRoot(container!);

const theme = createTheme({
  palette: {
    primary: {
      main: "rgb(193, 236, 195)", // 设置次要颜色
    },
    secondary: {
      main: "rgb(46, 125, 50)", // 设置次要颜色
    },
    text: {
      primary: "#173A5E",
      secondary: "#46505A",
    },
    action: {
      active: "#001E3C",
    },
    // success: {
    //   dark: "#009688",
    // },
  },
});
const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <div>
        <AppBar />
        <div className="app_wrapper">
          <div className="app_left">
            <LeftComponent />
          </div>
          <div className="app_right">
            <ImageList />
          </div>
        </div>
      </div>
    ),
  },
  {
    path: "/upload",
    caseSensitive: false, //是否匹配path的大小写
    element: (
      <div>
        <AppBar />
        <div className="app_wrapper">
          <div className="app_left">
            <LeftComponent />
          </div>
          <div className="app_right">
            <ImageUpload />
            <Crop />
          </div>
        </div>
      </div>
    ),
  },
  {
    path: "/mask",
    caseSensitive: false, //是否匹配path的大小写
    element: (
      <div>
        <AppBar />
        <div className="app_wrapper">
          <div className="app_left">
            <LeftComponent />
          </div>
          <div className="app_right">
            <Stage />;
          </div>
        </div>
      </div>
    ),
  },
]); //1.通过createBrowserRouter 创建一个路由表
root.render(
  <AppContextProvider>
    <ThemeProvider theme={theme}>
      <RouterProvider router={router} />
    </ThemeProvider>
  </AppContextProvider>
);
