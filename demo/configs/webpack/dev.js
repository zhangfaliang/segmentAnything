// Copyright (c) Meta Platforms, Inc. and affiliates.
// All rights reserved.

// This source code is licensed under the license found in the
// LICENSE file in the root directory of this source tree.

// development config
const { merge } = require("webpack-merge");
const commonConfig = require("./common");

module.exports = merge(commonConfig, {
  mode: "development",
  devServer: {
    historyApiFallback: true,
    allowedHosts: "all", // That solved it
    hot: true, // enable HMR on the server
    open: true,
    port: 6006,
    // These headers enable the cross origin isolation state
    // needed to enable use of SharedArrayBuffer for ONNX
    // multithreading.
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "credentialless",
    },
  },
  devtool: "cheap-module-source-map",
});
