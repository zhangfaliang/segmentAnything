const express = require("express");
const path = require("path");
const history = require("connect-history-api-fallback");

const app = express();

// app.use(express.static(path.join(__dirname, "dist")));
//添加 connect-history-api-fallback 中间件

// app.use(
//   history({
//     disableDotRule: true,
//     verbose: true,
//     index: "/",
//   })
// );

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// // 任何未处理的请求都会被发送到 index.html
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "dist", "index.html"));
// });

app.listen(8080);
console.log("listen:8080");
