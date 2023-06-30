// const postData = require("./request/index");
// @ts-ignore
// import { postData } from "./request/index";
// import delay from "lodash/delay";
const delay = require("lodash/delay");
const find = require("lodash/find");

const postData = async ({ url = "/save_image", data }) => {
  return await delay(() => {}, 1000);
  // await postData({ url, data });
};

class Queue {
  constructor() {
    this.taskList = [];
    this.isStart = false;
  }
  task = ({ data, url = "/save_image" }) => {
    this.taskList.push({ data, url, done: false });
    return this;
  };
  start = async () => {
    this.isStart = true;
    let i = 0;
    while (i < this.taskList.length) {
      const { data, url } = this.taskList[i];
      console.log(this.taskList.length, "lengthlength");
      await postData({ data, url });
      this.taskList[i].done = true;
      this.taskList.slice(i, 1);
      this.taskList.length = this.taskList.length - 1;
      // i++;
    }
    this.isStart = false;
  };
}

// module.exports = Queue;
const queue = new Queue();
queue.task({ data: "", url: "" });
queue.task({ data: "", url: "" });
queue.task({ data: "", url: "" });
queue.task({ data: "", url: "" });
queue.task({ data: "", url: "" });
queue.task({ data: "", url: "" });
queue.task({ data: "", url: "" });
queue.start();
