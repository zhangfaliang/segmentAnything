// const host = "https://sam.test.doublefs.com";
// https://sam.test.doublefs.com
//"";
let host =
  process.env.NODE_ENV === "production"
    ? "https://sam.doublefs.com"
    : "http://localhost:5000";
host = "http://localhost:5000";
export const postData = ({ url, data }: any) => {
  const processUrl = `${host}${url}`;
  return fetch(processUrl, {
    body: JSON.stringify(data), // must match 'Cont
    headers: {
      "content-type": "application/json",
    },
    method: "POST",
  })
    .then((response) => response.json()) // parses response to JSON
    .then((res) => {
      //请求状态埋点
      if (res) {
        return res;
      }
    })
    .catch((error: any) => {
      return { error: error };
    });
};
export const getData = ({ url }: any) => {
  const processUrl = ` ${host}${url}`;
  console.log(process.env.NODE_ENV);

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
    .catch((error: any) => {
      return { error: error };
    });
};
export const uploadData = ({ url, data }: any) => {
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
    .catch((error: any) => {
      return { error: error };
    });
};
