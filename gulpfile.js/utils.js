const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { src, dest } = require('gulp');
const inject = require("gulp-inject");
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

function fileCopy(pathInfo) {
  const { path, dir } = pathInfo;
  const outPutName = getOutputName(dir);

  fs.readFile(path, (err, data) => {
    if (err) throw err;

    fs.writeFile(`${distDir}/${outPutName}/index.html`, data, 'utf-8', err => {
      if (err) throw err;
      // console.log('write index html complete..');
    })
  })
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
        console.log(chalk.bgGrey('创建目录:'), chalk.redBright(chalk.underline(viewName) + "目录已存在~"));
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
              const assets = src(["./static/js/**/*.js", "./dist/css/common/*.css"], {
                read: false,
              });

              src(`${viewDir}/${viewName}/index.html`)
              .pipe(template({ name: viewName }))
              .pipe(inject(assets))
              .pipe(dest(`${viewDir}/${viewName}`))
              .pipe(dest(`${distDir}/${viewName}`));
            }
            console.log(chalk.bgGrey('创建模板:'), `${viewName} > index.${info.ext}创建成功!`);
            resolve(viewName);
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
    console.log(chalk.bgGrey('删除文件:'), chalk.underline(path) + ' delete completed!');
  } catch (err) {
    // throw err;
  }
}

/**
 * @method 获取改动页面正则
 * @param dir
 */
function getOutputName(dir) {
  const separator = path.sep;
  const reg = new RegExp(`src\\${separator}views\\${separator}(.*)`);
  const outPutName = dir.match(reg)[1];
  return outPutName || '';
}

module.exports = {
  mkView,
  fileCopy,
  fileUnlink,
  getOutputName
};
