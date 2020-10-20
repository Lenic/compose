const path = require("path");

// vite.config.js
module.exports = {
  port: 8077, // 服务端口
  alias: {
    "/@/": path.resolve(__dirname, "./src")
  }
};
