const fs = require('fs');
const path = require('path');
const viewDir = './src/views';
const scssDir = './src/scss';
const jsDir = './src/js';
const imgDir = './src/images';
const { src, dest } = require('gulp');
const template = require('gulp-template');


function getFileContent(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}

function mkView(end) {
  const args = process.argv;
  const viewName = args.length > 3 && args[args.length - 1].replace(/--/, "");

  if (!viewName) {
    throw new Error("view name is required... eg: gulp mkView --xxx");
  }

  const cssCon = getFileContent("./static/template/template.scss");
  const jsCon = getFileContent("./static/template/template.js");
  const htmlCon = getFileContent("./static/template/template.html");

  const writePaths = [
    { ext: "scss", con: cssCon },
    { ext: "js", con: jsCon },
    { ext: "html", con: htmlCon },
  ];
  const writeDirName = `${viewDir}/${viewName}`;
  let writeTask = [];

  fs.mkdir(writeDirName, (err) => {
    if (err) {
      if (err.code === "EEXIST") console.log(viewName + "目录已存在~");
    } else {
      writePaths.forEach((info, index) => {
        const writeFileName = `${writeDirName}/index.${info.ext}`;
        writeTask.push(
          new Promise((resolve, reject) => {
            fs.writeFile(writeFileName, info.con, (err) => {
              if (err) {
                throw err;
              } else {
                if (info.ext === "html") {
                  src(`${viewDir}/${viewName}/index.html`)
                  .pipe(template({ name: viewName }))
                  .pipe(dest(`${viewDir}/${viewName}`));
                }
                console.log(`${viewName} > index.${info.ext}创建成功!`);
                resolve();
              }
            });
          })
        )
      })
      Promise.all(writeTask).then(() => {
        console.log('执行完毕');
        end();
      })
    }
  });
}

module.exports = {
  mkView
};
