const express = require("express");
const path = require("path");
const history = require("connect-history-api-fallback");

const app = express();

app.get("/assets/data/*", async (req, res, next) => {
  const dataDir = path.join(__dirname, "src/assets/data/");
  const filePath = req.path.replace("/assets/data/", "");
  const fullFilePath = path.join(dataDir, filePath);
  try {
    res.sendFile(fullFilePath, {}, (err) => {
      if (err) {
        console.error(`无法发送文件：${fullFilePath}`);
        next(err);
      } else {
        console.log(`已发送文件：${fullFilePath}`);
      }
    });
  } catch (error) {
    next(error);
  }
});

app.get("/model/*", async (req, res, next) => {
  const dataDir = path.join(__dirname, "model/");
  const filePath = req.path.replace("/model/", "");
  const fullFilePath = path.join(dataDir, filePath);
  try {
    res.sendFile(fullFilePath, {}, (err) => {
      if (err) {
        console.error(`无法发送文件：${fullFilePath}`);
        next(err);
      } else {
        console.log(`已发送文件：${fullFilePath}`);
      }
    });
  } catch (error) {
    next(error);
  }
});

app.use(express.static(path.join(__dirname, "dist")));
// 添加 connect-history-api-fallback 中间件

app.use(
  history({
    disableDotRule: true,
    verbose: true,
    index: "/",
  })
);

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(8080, () => {
  console.log("监听端口：8080");
});
