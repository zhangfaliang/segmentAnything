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
    this.delayArr = [];
  }
  task = ({ data, url = "/save_image", callback }) => {
    this.taskList.push({ data, url, done: false, callback });
    return this;
  };
  start = async () => {
    this.isStart = true;

    while (this.taskList.length) {
      this.delayArr = this.taskList.splice(0);
      const { data, url, callback } = this.taskList.shift();
      console.log("任务启动");
      console.log(data?.imgName);
      // await delay(20000);
      const resData = await postData({ data, url });
      callback && callback(resData);
      this.delayArr.shift();
      console.log("任务完成");
    }
    this.isStart = false;
  };
}

module.exports = Queue;
