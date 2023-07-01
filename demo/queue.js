const { postData } = require("./request/nodeAPI");
const delay = (duration) =>
  new Promise((res, rej) => {
    setTimeout(() => {
      res({});
    }, duration);
  });
class Queue {
  constructor() {
    this.taskList = [];
    this.isStart = false;
  }
  task = ({ data, url = "/save_image", callback }) => {
    this.taskList.push({ data, url, done: false, callback });
    return this;
  };
  start = async () => {
    this.isStart = true;
    let i = 0;

    while (i < this.taskList.length) {
      const { data, url, callback } = this.taskList[i];
      console.log("任务启动");
      // await delay(4000);
      const resData = await postData({ data, url });
      // callback && callback(resData);
      console.log("任务完成");
      this.taskList[i].done = true;
      this.taskList.slice(i, 1);
      this.taskList.length = this.taskList.length - 1;
    }
    this.isStart = false;
  };
}

module.exports = Queue;
