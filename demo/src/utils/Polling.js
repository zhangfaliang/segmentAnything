const delay = (duration) =>
  new Promise((res, rej) => {
    setTimeout(() => {
      res({});
    }, duration);
  });
class Polling {
  constructor({ duration = 10000, stopPollingFlag = false }) {
    this.duration = duration;
    this.stopPollingFlag = stopPollingFlag;
    this.firstStartFlag = true;
  }
  startPolling = async ({ apiFn, apiArgs, apiCallback }) => {
    while (!this.stopPollingFlag) {
      //TODO 第一次进入不需要等待
      if (!this.firstStartFlag) {
        await delay(this.duration);
      }
      this.firstStartFlag = false;
      if (this.stopPollingFlag) break;
      const data = await apiFn(apiArgs);
      if (this.stopPollingFlag) break;
      apiCallback(data);
    }
  };
  stopPolling() {
    this.stopPollingFlag = true;
  }
}

export default Polling;
