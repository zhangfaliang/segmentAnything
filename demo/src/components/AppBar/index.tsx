import React, { useContext, useEffect, useState } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import AdbIcon from "@mui/icons-material/Adb";
// import PacmanLoader from "react-spinners/PacmanLoader";
import PacmanLoader from "../../components/Loading/index";
import { useNavigate } from "react-router-dom";
import LeftComponent from "../../components/LeftComponent/index.next";
import AppContext from "../../components/hooks/createContext";
import { InferenceSession, Tensor } from "onnxruntime-web";
import { handleImageScale } from "../../components/helpers/scaleHelper";
import { modelScaleProps } from "../../components/helpers/Interfaces";
import { onnxMaskToImage } from "../../components/helpers/maskUtils";
import { modelData } from "../../components/helpers/onnxModelAPI";
import { Helmet } from "react-helmet";

const ort = require("onnxruntime-web");
/* @ts-ignore */
import npyjs from "npyjs";

const pages = [
  { text: "图片列表", link: "/" },
  { text: "上传图片", link: "/upload" },
];
const settings = ["Profile", "Account", "Dashboard", "Logout"];

function ResponsiveAppBar() {
  const {
    clicks: [clicks],
    image: [image, setImage],
    maskImg: [, setMaskImg],
    loading: [loading, setLoading],
    previousMask: [previousMask, setPreviousMask],
    mergedMask: [, setMergedMask],
    globalLoadFile: [, setGlobalLoadFileLoadFile],
    rangeRects: [rangeRects],
    imageScale: [imageScale],
  } = useContext(AppContext)!;

  const navigate = useNavigate();
  const [openLeft, setOpenLeft]: any = React.useState(false);
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(
    null
  );
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(
    null
  );

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const [model, setModel] = useState<InferenceSession | null>(null); // ONNX model
  const [tensor, setTensor] = useState<Tensor | null>(null); // Image embedding tensor
  const [modelScale, setModelScale] = useState<modelScaleProps | null>(null);

  const loadFile = async ({ imgURL, npyURL, onnxURL }: any) => {
    setLoading(true);
    try {
      const img = new Image();
      img.src = imgURL.href;

      img.onload = () => {
        const { height, width, samScale } = handleImageScale(img);
        setModelScale({
          height: height, // original image height
          width: width, // original image width
          samScale: samScale, // scaling factor for image which has been resized to longest side 1024
        });
        img.width = width;
        img.height = height;
        setImage(img);
      };
      setMaskImg(null);
      setPreviousMask("");
      setMergedMask("");

      await Promise.resolve(loadNpyTensor(npyURL, "float32")).then(
        (embedding) => setTensor(embedding)
      );
      const initModel = async () => {
        try {
          if (onnxURL === undefined) return;
          const URL: string = onnxURL;
          const model = await InferenceSession.create(URL);
          setModel(model);
          setLoading(false);
        } catch (e) {
          console.log(e);
        }
      };
      initModel();
      navigate("/mask");
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };
  // console.log(model, "modelmodelmodelmodel--model");

  // console.log(tensor, "modelmodelmodelmodel--tensor");

  // 将 Numpy 文件解码为张量
  const loadNpyTensor = async (tensorFile: string, dType: string) => {
    let npLoader = new npyjs();

    const npArray = await npLoader.load(tensorFile);
    const tensor = new ort.Tensor(dType, npArray.data, npArray.shape);
    return tensor;
  };
  
  let dataRange = new Map()
  let currtDataRange = new Map()
  // Run the ONNX model every time clicks has changed
  useEffect(() => {
    runONNX();
    if (!image) return
    const width = (image as any).width
    const {x, y} = clicks ? clicks[0] : {x: 0, y: 0}
    const position = Math.round(width * Math.round(y) + Math.round(x))
    dataRange.clear()
    for (let i = 0; i < rangeRects.length; i ++) {
      const data = new Map()
      const rect = rangeRects[i]
      const rx = Math.round(rect.x * imageScale)
      const ry = Math.round(rect.y * imageScale)
      const w = Math.round(rect.w * imageScale)
      const h = Math.round(rect.h * imageScale)
      for (let i = ry; i < (ry+h); i++) {
        for (let j = rx; j < (rx+w); j++) {
          const index = i * width + j
          data.set(index, index)
        }
      }
      if (data.get(position)) {
        currtDataRange = data
      } else {
        dataRange = new Map([...dataRange, ...data])
      }
    }
    
  }, [clicks]);
  useEffect(() => {
    (window as any).loadFile = loadFile;
    // setGlobalLoadFileLoadFile(loadFile);
  }, []);
  const mergeMasks = (
    previousMask: any,
    currentMask: any,
    height: any,
    width: any
  ) => {
    if (!previousMask) {
      // 如果上次的掩码为空，则直接返回当前的掩码
      return currentMask;
    }
    const mergedMask = new Uint8ClampedArray(height * width);
    
    if (currtDataRange.size) {
      for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
          const index = i * width + j;
          if (currtDataRange.get(index)) {
            // 检查当前像素位置的掩码是否与上次的掩码存在交集
            mergedMask[index] = Math.max(
              previousMask[index],
              currentMask[index] * 255
            );
          } else {
            mergedMask[index] = previousMask[index]
          }
        }
      }
    } else {
      for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
          const index = i * width + j;
          if (dataRange.get(index)) {
            mergedMask[index] = previousMask[index]
          } else {
            mergedMask[index] = Math.max(
              previousMask[index],
              currentMask[index] * 255
            );
          }
        }
      }
    }
    return mergedMask;
  };

  const removeIntersectingMasks = (
    previousMask: any,
    currentMask: any,
    height: any,
    width: any
  ) => {
    if (!previousMask) {
      // 如果上次的掩码为空，则直接返回当前的掩码
      return currentMask;
    }
    const removedMask = new Uint8ClampedArray(height * width);
   
    if (currtDataRange.size) {
      for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
          const index = i * width + j;
          if (currtDataRange.get(index)) {
            if (currentMask[index] > 0) {
              removedMask[index] = 0;
            } else {
              removedMask[index] = previousMask[index];
            }
          } else {
            removedMask[index] = previousMask[index];
          }
        }
      }
    } else {
      for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
          const index = i * width + j;
          if (dataRange.get(index)) {
            removedMask[index] = previousMask[index];
          } else {
            if (currentMask[index] > 0) {
              removedMask[index] = 0;
            } else {
              removedMask[index] = Math.max(
                previousMask[index],
                currentMask[index] * 255
              );
            }
          }
        }
      }
    }
    return removedMask;
  };

  const runONNX = async () => {
    try {
      if (
        model === null ||
        clicks === null ||
        tensor === null ||
        modelScale === null
      )
        return;
      else {
        //首先检查模型、输入数据和模型比例是否都不为空，
        // 如果为空则返回。如果不为空，则调用onnxModelAPI.tsx文件中的modelData()
        let feeds: any = modelData({
          clicks,
          tensor,
          modelScale,
        });
        if (feeds === undefined) return;
        // 使用从 modelData() 返回的数据进行 SAM ONNX 模型的运行
        const results = await model.run(feeds);
        const output = results[model.outputNames[0]];
        const lastClick = clicks[clicks.length - 1];
        if (lastClick.clickType !== "right") {
          // 将上次的掩码与最新的掩码合并
          const mergedOutput = mergeMasks(
            previousMask,
            output.data,
            output.dims[2],
            output.dims[3]
          );
          const mask = onnxMaskToImage(
            mergedOutput,
            output.dims[2],
            output.dims[3],
            dataRange
          );
          // 将合并后的掩码转换为图像，并设置为 mergedMask 状态
          setMergedMask(mask);
          // 将最新的输出掩码设置为 maskImg 状态
          setMaskImg(mask);
          // 更新上次的掩码为最新的输出掩码
          setPreviousMask(mergedOutput);
          // setPreviousMask(mergedOutput);
        } else {
          // 如果是右击，则去除相应的掩码
          const mergedOutput = removeIntersectingMasks(
            previousMask,
            output.data,
            output.dims[2],
            output.dims[3]
          );
          const mask = onnxMaskToImage(
            mergedOutput,
            output.dims[2],
            output.dims[3],
            dataRange
          );
          // 将合并后的掩码转换为图像，并设置为 mergedMask 状态
          setMergedMask(mask);
          // 将最新的输出掩码设置为 maskImg 状态
          setMaskImg(mask);
          setPreviousMask(mergedOutput);
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <>
      <AppBar position="fixed">
        <Helmet>
          <link
            href="/assets/favicon.ico"
            rel="icon"
            type="image/png"
            sizes="32x32"
          />
        </Helmet>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* <AdbIcon sx={{ display: { xs: "none", md: "flex" }, mr: 1 }} /> */}
            <img
              src="https://mpi.halarastatic.com/upload/online/16/14/07/12/22/_9323433142.png"
              alt="halara"
              title="halara"
              style={{ width: "200px", height: "30px", marginRight: "30px" }}
            ></img>
            <Typography
              variant="h6"
              noWrap
              component="a"
              onClick={() => {
                setOpenLeft(!openLeft);
              }}
              // href="/"
              sx={{
                mr: 2,
                display: { xs: "none", md: "flex" },
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: ".3rem",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              全量全速
            </Typography>

            <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{
                  display: { xs: "block", md: "none" },
                }}
              >
                {pages.map(({ text, link }: any) => (
                  <MenuItem
                    key={text}
                    onClick={() => {
                      navigate(link);
                    }}
                  >
                    <Typography textAlign="center">{text}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
            <AdbIcon sx={{ display: { xs: "flex", md: "none" }, mr: 1 }} />
            <Typography
              variant="h5"
              noWrap
              component="a"
              href=""
              sx={{
                mr: 2,
                display: { xs: "flex", md: "none" },
                flexGrow: 1,
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: ".3rem",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              全量全速
            </Typography>
            <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
              {pages.map(({ text, link }: any) => (
                <Button
                  key={text}
                  onClick={() => {
                    navigate(link);
                  }}
                  sx={{ my: 2, color: "inherit", display: "block" }}
                >
                  {text}
                </Button>
              ))}
            </Box>

            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar
                    alt="Remy Sharp"
                    src="https://mui.com/static/images/avatar/4.jpg"
                  />
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: "45px" }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                {settings.map((setting) => (
                  <MenuItem key={setting} onClick={handleCloseUserMenu}>
                    <Typography textAlign="center">{setting}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      <LeftComponent openLeft={openLeft} setOpenLeft={setOpenLeft} />
      {loading && (
        <div className="imageUp_loading_true">
          <PacmanLoader />
        </div>
      )}
    </>
  );
}
export default ResponsiveAppBar;
