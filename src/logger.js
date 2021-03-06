const fs = require("fs");
const storageFilePath = "./history.log";

if (!fs.existsSync(storageFilePath)) fs.writeFileSync(storageFilePath);

module.exports.addPath = (path) => {
  fs.appendFileSync(storageFilePath, path + "\n");
};

module.exports.getPathes = (path) => {
  return fs.readFileSync(storageFilePath, { encoding: "utf-8" });
};
