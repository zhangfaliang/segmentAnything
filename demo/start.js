const express = require("express");
const path = require("path");
const history = require("connect-history-api-fallback");
const Queue = require("./queue");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");

const queue = new Queue();

app.use(cors());
app.use(bodyParser.json({ limit: "100mb" }));
app.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));

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
/**
 * 创建任务列表
 */
app.post("/generate/mask", async (req, res, next) => {
  try {
    const taskLength = queue.taskList.length;
    if (taskLength >= 5) {
      res.send({
        code: -1,
        message: "任务数大于5，稍后再试",
        data: {
          desc: `任务数大于5，稍后再试`,
        },
      });
      return;
    }
    if (!queue.isStart && taskLength > 0) {
      queue.start();
    } else {
      queue.task({
        data: {
          size: req.body.size,
          imgName: req.body.imgName,
          imgData: req.body.imgData,
        },
      });
    }
    res.send({
      code: 0,
      message: "",
      data: {
        desc: `当前任务数为${taskLength},你的任务是第${taskLength + 1}个`,
      },
    });
  } catch (error) {
    res.send({
      code: -1,
      message: "",
      data: {
        desc: `系统除了点问题，请稍后再试`,
      },
    });
    next(error);
  }
});
app.get("/get/maskTask", async (req, res, next) => {
  try {
    res.send({
      code: 0,
      message: "success",
      data: {
        desc: `${queue?.taskList?.length}任务数为在执行`,
        queueNumber: queue?.taskList?.length,
      },
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

app.listen(9090, () => {
  console.log("监听端口：9090");
});
