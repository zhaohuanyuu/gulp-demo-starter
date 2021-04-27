const { src, dest } = require("gulp");
const inject = require("gulp-inject");
const imagemin = require("gulp-imagemin");
const { fileUnlink, getOutputReg } = require('./utils');

function optimizeImage(browserSync, pathInfo) {
  const { path, dir, base, eventType } = pathInfo;
  let srcPath = path;
  const outPutReg = getOutputReg();
  let outPutDir = dir.match(outPutReg)[1];
  if (outPutDir.indexOf('\\') > -1) outPutDir = outPutDir.replace(/\\/g, '/');
  const distPath = `./dist/${outPutDir}`;

  if (eventType === 'unlink') {
    return fileUnlink(`${distPath}/${base}`);
  }

  return src(srcPath, {allowEmpty: true})
          .pipe(
            imagemin([
              imagemin.mozjpeg({
                quality: 75,
                progressive: true,
              }),
              imagemin.optipng({
                optimizationLevel: 5,
              }),
              imagemin.gifsicle({
                interlaced: true,
              }),
              imagemin.svgo({
                plugins: [
                  {
                    removeViewBox: true,
                  },
                  {
                    cleanupIDs: false,
                  },
                ],
              }),
            ])
          )
          .pipe(dest(distPath))
          .pipe(browserSync.stream());
}

function htmlInject() {
  const target = src("./src/views/**/*.html");
  const sources = src(["./static/js/**/*.js", "./dist/css/common/*.css"], {
    read: false,
  });

  return target.pipe(inject(sources)).pipe(dest("./src/views"));
}

module.exports = {
  htmlInject,
  optimizeImage,
};
