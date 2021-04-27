const fs = require('fs');
const path = require('path');
const { src, dest } = require('gulp');
const template = require('gulp-template');

const viewDir = './src/views';
const distDir = './dist'

/**
 * @method 获取指定文件文本
 * @param filePath
 * @returns {string}
 */
function getFileContent(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}

/**
 * @method 创建页面模板
 * @param end
 */
function mkView(end) {
  const args = process.argv;
  const viewName = args.length > 3 && args[args.length - 1].replace(/--/, "");

  if (!viewName) {
    throw new Error("view name is required... eg: gulp mkView --xxx");
  }

  const cssCon = getFileContent("./public/template/template.scss");
  const jsCon = getFileContent("./public/template/template.js");
  const htmlCon = getFileContent("./public/template/template.html");

  const writePaths = [
    { ext: "scss", con: cssCon },
    { ext: "js", con: jsCon },
    { ext: "html", con: htmlCon },
  ];
  const writeDirName = `${viewDir}/${viewName}`;

  let writeTask = [];

  fs.mkdir(writeDirName, (err) => {
    if (err) {
      if (err.code === "EEXIST") {
        console.log(viewName + "目录已存在~");
        return false;
      }
    }

    writePaths.forEach((info, index) => {
      const writeFileName = `${writeDirName}/index.${info.ext}`;
      writeTask.push(
        new Promise((resolve, reject) => {
          fs.writeFile(writeFileName, info.con, (err) => {
            if (err) throw err;

            if (info.ext === "html") {
              src(`${viewDir}/${viewName}/index.html`)
              .pipe(template({ name: viewName }))
              .pipe(dest(`${viewDir}/${viewName}`))
              .pipe(dest(`${distDir}/${viewName}`));
            }
            console.log(`${viewName} > index.${info.ext}创建成功!`);
            resolve();
          });
        })
      )
    })

    Promise.all(writeTask).then(() => end());
  });
}

/**
 * @method 删除指定文件
 * @param path
 */
function fileUnlink(path) {
  try {
    fs.unlinkSync(path);
    console.log(path + ' delete completed!');
  } catch (err) {
    // throw err;
  }
}

/**
 * @method 获取改动页面正则
 * @returns {RegExp}
 */
function getOutputReg() {
  const separator = path.sep;
  return new RegExp(`src\\${separator}views\\${separator}(.*)`)
}

module.exports = {
  mkView,
  fileUnlink,
  getOutputReg
};
