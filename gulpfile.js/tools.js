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

    fs.mkdir(writeDirName, (err) => {
      if (err) {
        if (err.code === "EXIST") throw new Error("该目录已存在~");
      } else {
        writePaths.forEach((info, index) => {
          const writeFileName = `${writeDirName}/index.${info.ext}`;
          fs.writeFile(writeFileName, info.con, (err) => {
            if (err) {
              throw err;
            } else {
              console.log(`${viewName} > index.${info.ext}创建成功!`);
  
              if (info.ext === "html") {
                return src(`${viewDir}/${viewName}/index.html`)
                  .pipe(template({ name: viewName }))
                  .pipe(dest(`${viewDir}/${viewName}`));
              }
            }
          });
        })
      }
    });
  end();
}

module.exports = {
  mkView
};
