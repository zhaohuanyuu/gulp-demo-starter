const { src, dest } = require("gulp");
const inject = require("gulp-inject");
const imagemin = require("gulp-imagemin");
const { fileUnlink, getOutputName } = require('./utils');

/**
 * @method 图片体积优化
 * @param browserSync
 * @param pathInfo
 * @returns {void|*}
 */
function optimizeImage(browserSync, pathInfo) {
  const { path, dir, base, eventType } = pathInfo;
  let outPutName = getOutputName(dir);
  if (outPutName.indexOf('\\') > -1) outPutName = outPutName.replace(/\\/g, '/');
  const distPath = `./dist/${outPutName}`;

  if (eventType === 'unlink') {
    return fileUnlink(`${distPath}/${base}`);
  }

  return src(path, {allowEmpty: true})
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

/**
 * @method 模板注入
 * @returns {*}
 */
function htmlInject() {
  const target = src("./src/views/**/*.html");
  const sources = src(["./static/js/**/*.js", "./dist/css/common/*.css"], {
    read: false,
  });

  return target.pipe(inject(sources)).pipe(dest("./src/views"));
}

module.exports = {
  optimizeImage,
};
