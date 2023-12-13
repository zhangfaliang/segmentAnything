import "./index.scss";
import React, { useState, useContext, useEffect, useRef } from "react";
import "./index.scss";
import { ToastContainer, toast } from "react-toastify";
import AppContext from "../../components/hooks/createContext";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Slider from "@mui/material/Slider";
import FolderZipIcon from '@mui/icons-material/FolderZip';
import CloseIcon from '@mui/icons-material/Close';
import LinearProgress from '@mui/material/LinearProgress';
import { getData } from "../../../request/index";
import { postData } from "../../../request/index";
declare module 'react' {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    // extends React's HTMLAttributes
    directory?: string;
    webkitdirectory?:string;
  }
}
export default () => {
  const {
    generationCompletedFiles: [, setGenerationCompletedFiles],
  } = useContext(AppContext)!;
  const [loading, setLoading] = React.useState(false);
  const uploadWrapper = useRef<HTMLDivElement>(null);
  const uploadInpuRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = React.useState("");
  const [file, setFile] = React.useState<unknown>(null);
  const [boxThreshold, setBoxThreshold] = React.useState(0.2);
  const [textThreshold, setTextThreshold] = React.useState(0.3);
  const [expandAmount, setExpandAmount] = React.useState(10);
  const [textPrompt, setTextPrompt] = React.useState("pants.skirt.tops.clothes.hands.foots.shoes");

  useEffect(() => {
    addEvent()
    getFolderList()
  }, [])

  async function getFolderList() {
    const res = await getData({ url: "/python/getFolderList"});
    setGenerationCompletedFiles(res.data)
  }
  function addEvent() {
    const dropEle = uploadWrapper.current as HTMLDivElement
    dropEle.addEventListener('drop', e => {
      e.preventDefault();
      e.stopPropagation();
      dropEle.style.borderColor = "#e5e7eb"
      const file = e.dataTransfer?.files[0] as any
      if (file.type !== "application/zip") {
        showToast(`😂--图片格式有误，请上传zip格式文件`, 3000)
      } else {
        setFileName(file.name)
        setFile(file)
      }
    }, false)

    dropEle.addEventListener('dragover', e => {
      e.preventDefault();
      e.stopPropagation();
      dropEle.style.borderColor = "#60f267"
    }, false)

    dropEle.addEventListener('dragleave', e => {
      e.preventDefault();
      e.stopPropagation();
      dropEle.style.borderColor = "#e5e7eb"
    }, false)
  }
  const onChange = (event: any) => {
    // var files = event.target.files;
    // if (!files.length) return 
    // console.log(files)
    // var relativePath = files[0].webkitRelativePath.split("/")[0];
    // console.log(relativePath)

    var file = event.target.files[0];
    if (!file) return
    setFileName(file.name)
    setFile(file)
  };
  const deleteFile = () => {
    setFileName("")
    setFile(null)
    uploadInpuRef.current&&(uploadInpuRef.current.value = "")
  }
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.id == "box_threshold") {
      setBoxThreshold(event.target.value === '' ? 0 : Number(event.target.value));
    } else if (event.target.id == "text_threshold") {
      setTextThreshold(event.target.value === '' ? 0 : Number(event.target.value));
    } else if (event.target.id == "expand_amount") {
      setExpandAmount(event.target.value === '' ? 0 : Number(event.target.value));
    }
  };
  const boxThresholdSliderChange = (event: Event, newValue: number | number[]) => {
    setBoxThreshold(newValue as number);
  };
  const textThresholdSliderChange = (event: Event, newValue: number | number[]) => {
    setTextThreshold(newValue as number);
  };
  const expandAmountSliderChange = (event: Event, newValue: number | number[]) => {
    setExpandAmount(newValue as number);
  };
  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    if (event.target.id == "box_threshold") {
      if (boxThreshold < 0) {
        setBoxThreshold(0);
      } else if (boxThreshold > 1) {
        setBoxThreshold(1);
      }
    } else if (event.target.id == "expand_amount") {
      if (expandAmount < 0) {
        setExpandAmount(0);
      } else if (expandAmount > 100) {
        setExpandAmount(100);
      }
    }
  };

  const submit = () => {
    if (!file) return showToast(`😞--请上传文件`, 2000)
    var reader = new FileReader();
    reader.readAsDataURL(file as Blob);
    reader.onload = function(){
      setLoading(true)
      const result = (this.result as string)?.replace(/data:application\/zip;base64,/, "")
      postData({ url: "/python/grounded",
        data: {
          file: result,
          fileName: fileName,
          box_threshold: boxThreshold,
          expand_amount: expandAmount,
          text_threshold: textThreshold,
          text_prompt: textPrompt
        } 
      }).then(res => {
        setLoading(false)
        if (res.status === 'success') getFolderList()
      });
    }
  }
  function showToast(msg: string, time: number) {
    toast(msg, {
      position: "top-center",
      autoClose: time,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "light",
    });
  }
  return (
    <div className="App">
      <ToastContainer />
      <input ref={uploadInpuRef} style={{display: "none"}} type="file" accept=".zip" onChange={onChange}/>
      { fileName ? 
        <div className="file-wrapper">
          <FolderZipIcon className="folder-zip-icon"></FolderZipIcon>
          <span className="file-name">{fileName}</span>
          <CloseIcon className="close-icon" onClick={deleteFile}></CloseIcon>
        </div>
        :
        <div ref={uploadWrapper} className="upload-wrapper">
          <p className="tips"
            onClick={() => {
              uploadInpuRef.current?.click()
            }}
          >
            <span>拖放文件至此处</span>
            <span>-或-</span>
            <span>点击上传</span>
          </p>
          <span className="tips2">只支持zip文件，文件夹重名会将已上传的文件覆盖</span>
        </div>
      }
      <div className="form_box">
        <div className="form_item">
          <span className="label">GroundingDINO Detection Prompt（提示词）</span>
          <TextField
            hiddenLabel
            defaultValue={textPrompt}
            variant="outlined"
            size="small"
            onChange={(event) => {
              setTextPrompt(event.target.value)
            }}
          />
        </div>
        <div className="form_item form_item_small">
          <Grid container spacing={2} alignItems="center">
            <Grid item xs>
              <span className="label">GroundingDINO Box Threshold（识别置信度）</span>
            </Grid>
            <Grid item>
              <TextField
                id="box_threshold"
                value={boxThreshold}
                size="small"
                onChange={handleInputChange}
                onBlur={handleBlur}
                inputProps={{
                  step: 0.001,
                  min: 0,
                  max: 1,
                  type: 'number',
                }}
              />
            </Grid>
          </Grid>
          <Slider value={typeof boxThreshold === 'number' ? boxThreshold : 0} step={0.001} min={0} max={1} onChange={boxThresholdSliderChange} aria-label="Default" valueLabelDisplay="off" />
        </div>
        <div className="form_item form_item_small">
          <Grid container spacing={2} alignItems="center">
            <Grid item xs>
              <span className="label">GroundingDINO Text Threshold（提示词相关性）</span>
            </Grid>
            <Grid item>
              <TextField
                id="text_threshold"
                value={textThreshold}
                size="small"
                onChange={handleInputChange}
                onBlur={handleBlur}
                inputProps={{
                  step: 0.001,
                  min: 0,
                  max: 1,
                  type: 'number',
                }}
              />
            </Grid>
          </Grid>
          <Slider value={typeof textThreshold === 'number' ? textThreshold : 0} step={0.001} min={0} max={1} onChange={textThresholdSliderChange} aria-label="Default" valueLabelDisplay="off" />
        </div>
        <div className="form_item form_item_small">
          <Grid container spacing={2} alignItems="center">
            <Grid item xs>
            <span className="label">Specify the amount that you wish to expand the mask by（展开遮罩的量，推荐 0-10）</span>
            </Grid>
            <Grid item>
              <TextField
                id="expand_amount"
                value={expandAmount}
                size="small"
                onChange={handleInputChange}
                onBlur={handleBlur}
                inputProps={{
                  step: 1,
                  min: 0,
                  max: 100,
                  type: 'number',
                }}
              />
            </Grid>
          </Grid>
          <Slider value={typeof expandAmount === 'number' ? expandAmount : 0} step={1} min={0} max={100} onChange={expandAmountSliderChange} aria-label="Default" valueLabelDisplay="off" />
        </div>
      </div>
      <Button 
        className="start_batch_process"
        disabled={loading}
        onClick={submit}
        variant="contained"
      >Start batch process
      </Button>
      {loading ? <LinearProgress color="success" /> : ''}
    </div>
  )
}
