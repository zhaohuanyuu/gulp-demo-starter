const { src, dest } = require("gulp");
const inject = require("gulp-inject");
const imagemin = require("gulp-imagemin");
const { fileUnlink } = require('./tools');

function optimizeImage(browserSync, pathInfo) {
  const { path, dir, base, eventType } = pathInfo;
  let srcPath = path;
  const outPutReg = /src\/views\/(.*)/;
  const outPutDir = dir.match(outPutReg)[1];
  const distPath = `./dist/${outPutDir}`;

  if (eventType === 'unlink') {
    return fileUnlink(distPath+ '/' + base);
  }

  return src(srcPath, {allowEmpty: true})
          .pipe(
            imagemin([
              imagemin.gifsicle({
                interlaced: true,
              }),
              imagemin.mozjpeg({
                quality: 75,
                progressive: true,
              }),
              imagemin.optipng({
                optimizationLevel: 5,
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
