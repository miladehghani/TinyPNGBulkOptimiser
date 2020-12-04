const { addPath, getPathes } = require("./logger");

const fs = require("fs");
const path = require("path");
const Tinify = require("tinify");

const isImage = (fileName) => {
  const parts = fileName.split(".");
  if (parts.length > 1) {
    const ext = parts[parts.length - 1].toLowerCase();
    return ext === "png" || ext === "jpg" || ext === "jpeg";
  }
  return false;
};

const optimiseFolder = async (basePath) => {
  if (!fs.existsSync(basePath)) return;

  const files = fs.readdirSync(basePath);
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (isImage(file)) {
      const response = await optimise(file, basePath);
      tinifyErrorHandler(response);
    } else {
      await optimiseFolder(path.join(basePath, file));
    }
  }
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

module.exports = async (API_KEYS, basePath) => {
  await setApiKey(API_KEYS);
  await optimiseFolder(basePath);
};
