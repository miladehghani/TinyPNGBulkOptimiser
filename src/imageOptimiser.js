const fs = require("fs");
const path = require("path");
const Tinify = require("tinify");
const { addPath, getPathes } = require("./logger");
let estimationNumber = 0;
let optimisedImagesNumber = 0;

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
    const fileName = fileDirent.name;
    if (fileDirent.isFile() && isImage(fileName)) {
      await callback(basePath, fileName);
    } else if (fileDirent.isDirectory()) {
      await forEachFileInFolderTree(path.join(basePath, fileName), callback);
    }
  }
};

const optimiseFolder = async (basePath) => {
  await forEachFileInFolderTree(basePath, async (path, fileName) => {
    const err = await optimise(path, fileName);
    if (!err) console.log("Optimised: ", fileName);
    else if (err instanceof Tinify.AccountError) {
      const err = await setApiKey();
      if (err) {
        console.log(err);
        process.exit(1);
      }
    } else console.log(err);
  });
};

const optimise = async (basePath, fileName) => {
  return new Promise(async (resolve) => {
    const imagePath = path.join(basePath, fileName);
    const exist = fs.existsSync(imagePath);
    if (getPathes().includes(imagePath)) {
      console.log("Already optimised");
      return resolve();
    }
    if (!exist) return resolve("File not found " + imagePath);
    const source = Tinify.fromFile(imagePath);
    source.toFile(imagePath, (err) => {
      if (!err) {
        resolve();
        addPath(imagePath);
        optimisedImagesNumber++;
      } else resolve(err);
    });
  });
};

const validateKey = async (key) => {
  return new Promise((resolve) => {
    Tinify.key = key;
    Tinify.validate((err) => {
      if (err instanceof Tinify.AccountError) resolve("INVALID_API_KEY");
      else if (err) resolve(err.message);
    });
  });
};

const setApiKey = async (API_KEYS) => {
  let err;
  for (let i = 0; i < API_KEYS.length; i++) {
    err = await validateKey(API_KEYS[i]);
    if (!err) return;
  }
  return err;
};

module.exports.estimation = async (basePath) => {
  await forEachFileInFolderTree(
    basePath,
    async (basePath, fileName) => estimationNumber++
  );
  console.log(`Number of estimated images: ${estimationNumber}`);
  return estimationNumber;
};

module.exports.optimise = async (API_KEYS, basePath) => {
  const err = await setApiKey(API_KEYS);
  if (!err) {
    await optimiseFolder(basePath);
    return optimisedImagesNumber;
  } else return err;
};
