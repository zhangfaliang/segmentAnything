const fetch = require("node-fetch");
let host =
  process.env.NODE_ENV === "production"
    ? "https://sam.doublefs.com"
    : "http://10.1.0.104:5000";

const postData = ({ url, data }) => {
  const processUrl = `${host}${url}`;
  console.log(`请求地址为：${processUrl}`);
  return fetch(processUrl, {
    body: JSON.stringify(data), // must match 'Cont
    headers: {
      "content-type": "application/json",
    },
    method: "POST", // *GET, POST, PUT, DELETE, etc.
  })
    .then((response) => response.json()) // parses response to JSON
    .then((res) => {
      //请求状态埋点
      if (res) {
        console.log(`请求结果：`, res);
        return res;
      }
    })
    .catch((error) => {
      console.log(`ERR:${error}  -- 请求地址为：${processUrl}`);

      return { error: error };
    });
};
const getData = ({ url }) => {
  const processUrl = `${host}${url}`;
  return fetch(processUrl, {
    // body: JSON.stringify(data), // must match 'Content-Type' header
    // cache: 'no-store', // *default, no-cache, reload, force-cache, only-if-cached
    // credentials: "include", // include, same-origin, *omit
    headers: {},
    method: "GET", // *GET, POST, PUT, DELETE, etc.
  })
    .then((response) => response.json()) // parses response to JSON
    .then((res) => {
      if (
        process.env.NEXT_PUBLIC_APP_ID === "10" &&
        processUrl.includes("api/v1/cart/cartCount")
      ) {
      }

      if (res) {
        return res;
      }
    })
    .catch((error) => {
      return { error: error };
    });
};
const uploadData = ({ url, data }) => {
  const processUrl = `${host}${url}`;

  return fetch(processUrl, {
    body: JSON.stringify(data), // must match 'Cont
    headers: {
      "content-type": "application/json",
    },
    method: "POST", // *GET, POST, PUT, DELETE, etc.
  })
    .then((response) => response.json()) // parses response to JSON
    .then((res) => {
      if (res) {
        return res;
      }
    })
    .catch((error) => {
      return { error: error };
    });
};

module.exports = {
  postData,
  getData,
  uploadData,
};
