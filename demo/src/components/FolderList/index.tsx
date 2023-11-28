/*
 * @Author: zhao v-zhaoyongfei@doublefs.com
 * @Date: 2023-11-20 14:12:37
 * @LastEditors: zyf1910 xz397673705@163.com
 * @LastEditTime: 2023-11-28 15:23:06
 * @FilePath: /segmentAnything/demo/src/components/FolderList/index.tsx
 * @Description: 
 */
import React, { useContext } from "react";
import AppContext from "../../components/hooks/createContext";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import FolderZipIcon from '@mui/icons-material/FolderZip';
import { downloadData } from "../../../request/index";
import "./index.scss";

export default ({}: any) => {
  const {
    generationCompletedFiles: [generationCompletedFiles],
  } = useContext(AppContext)!;

  function downloadFile(fileName: string) {
    downloadData({ url: "/python/downloadFile?fileName=" + fileName }).then(res => {
      let a = document.createElement('a');
      let url = window.URL.createObjectURL(res);
      const [name, extension] = fileName.split('.')
      let filename =  `${name}_mask.${extension}`
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }
  return (
    <div className="folder_list_wrapper">
      <p className="title">已完成任务</p>
      <List>
        {
          generationCompletedFiles&&generationCompletedFiles.map((item:string) => {
            return (
              <ListItem className="file-list" key={item} onClick={() => downloadFile(item)}>
                <div>
                  <FolderZipIcon className="folder-icon" fontSize="small"/>
                  <span className="file-name">{item}</span>
                </div>
                <svg className="delete-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1484" width="200" height="200"><path d="M170.666667 768m42.666666 0l597.333334 0q42.666667 0 42.666666 42.666667l0 0q0 42.666667-42.666666 42.666666l-597.333334 0q-42.666667 0-42.666666-42.666666l0 0q0-42.666667 42.666666-42.666667Z" p-id="1485" fill="#6b7280"></path><path d="M170.666667 853.333333m0-42.666666l0-85.333334q0-42.666667 42.666666-42.666666l0 0q42.666667 0 42.666667 42.666666l0 85.333334q0 42.666667-42.666667 42.666666l0 0q-42.666667 0-42.666666-42.666666Z" p-id="1486" fill="#6b7280"></path><path d="M768 853.333333m0-42.666666l0-85.333334q0-42.666667 42.666667-42.666666l0 0q42.666667 0 42.666666 42.666666l0 85.333334q0 42.666667-42.666666 42.666666l0 0q-42.666667 0-42.666667-42.666666Z" p-id="1487" fill="#6b7280"></path><path d="M512 640a42.666667 42.666667 0 0 1-24.746667-7.68l-170.666666-120.32a42.666667 42.666667 0 0 1-10.24-59.306667 42.666667 42.666667 0 0 1 59.733333-10.24L512 544.426667l145.066667-109.226667a42.666667 42.666667 0 0 1 51.2 68.266667l-170.666667 128a42.666667 42.666667 0 0 1-25.6 8.533333z" p-id="1488" fill="#6b7280"></path><path d="M512 554.666667a42.666667 42.666667 0 0 1-42.666667-42.666667V170.666667a42.666667 42.666667 0 0 1 85.333334 0v341.333333a42.666667 42.666667 0 0 1-42.666667 42.666667z" p-id="1489" fill="#6b7280"></path></svg>
              </ListItem>
            )
          })
        }
      </List>
    </div>
  );
};
