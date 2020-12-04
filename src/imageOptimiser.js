const fs = require("fs");
const path = require("path");
const Tinify = require("tinify");
const { addPath, getPathes } = require("./logger");

const isImage = (fileName) => {
  const parts = fileName.split(".");
  if (parts.length > 1) {
    const ext = parts[parts.length - 1].toLowerCase();
    return ext === "png" || ext === "jpg" || ext === "jpeg";
  }
  return false;
};

const forEachFileInFolderTree = async (basePath, callback) => {
  if (!fs.lstatSync(basePath).isDirectory()) return;

  const files = fs.readdirSync(basePath, { withFileTypes: true });
  for (let i = 0; i < files.length; i++) {
    const fileDirent = files[i];
    const file = fileDirent.name;
    if (fileDirent.isFile() && isImage(file)) {
      await callback(file);
    } else if (fileDirent.isDirectory()) {
      forEachFileInFolderTree(path.join(basePath, file), callback);
    }
  }
};

const optimiseFolder = async (basePath) => {
  await forEachFileInFolderTree(basePath, async (file) => {
    const response = await optimise(file, basePath);
    tinifyErrorHandler(response);
    console.log("Optimise result", file, response);
  });
};

const optimise = async (fileName, basePath) => {
  return new Promise(async (resolve, reject) => {
    const imagePath = path.join(basePath, fileName);
    const exist = fs.existsSync(imagePath);
    if (getPathes().includes(imagePath)) return resolve();
    if (!exist) return reject("File not found");
    const source = Tinify.fromFile(imagePath);
    source.toFile(imagePath, (err) => {
      if (!err) {
        resolve(err);
        addPath(imagePath);
      } else reject(err);
    });
  });
};

const tinifyErrorHandler = (err) => {
  if (!err) return;
  else if (err instanceof Tinify.AccountError) {
    console.log("AccountError");
    setApiKey();
    // Verify your API key and account limit.
  } else if (err instanceof Tinify.ClientError) {
    console.log("ClientError");
    // Check your source image and request options.
  } else if (err instanceof Tinify.ServerError) {
    console.log("ServerError");
    // Temporary issue with the Tinify API.
  } else if (err instanceof Tinify.ConnectionError) {
    console.log("ConnectionError");
    // A network connection error occurred.
  } else {
    console.log("UnknownError");
    // Something else went wrong, unrelated to the Tinify API.
  }
  console.log("tinifyErrorHandler, " + err.message);
};

const validateKey = async (key) => {
  return new Promise((resolve, reject) => {
    Tinify.key = key;
    Tinify.validate((err, data) => {
      if (!err && Tinify.compressionCount < 500) resolve();
      else reject(err);
    });
  });
};

const setApiKey = async (API_KEYS) => {
  for (let i = 0; i < API_KEYS.length; i++) {
    const err = await validateKey(API_KEYS[i]);
    if (!err) return;
  }
  console.log("Out of API_KEY");
  process.exit(1);
};

module.exports.optimise = async (API_KEYS, basePath) => {
  await setApiKey(API_KEYS);
  await optimiseFolder(basePath);
};

let estimationNumber = 0;
module.exports.estimation = async (basePath) => {
  await forEachFileInFolderTree(basePath, () => estimationNumber++);
  console.log(`Number of estimated images: ${estimationNumber}`);
  return estimationNumber;
};
