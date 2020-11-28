const inject = require('gulp-inject');
const changed = require('gulp-changed');
const imagemin = require("gulp-imagemin");

const { src, dest } = require('gulp');


function compactImage() {
  return src(imgDir)
    .pipe(changed(dist + "images"))
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.jpegtran({ progressive: true }),
        imagemin.optipng({ optimizationLevelL: 5 }),
      ])
    )
    .pipe(dest(dist + "/image/"));
}

function htmlInject() {
  const target = src("./src/views/**/*.html");
  const sources = src(["./static/js/**/*.js", "./dist/css/common/*.css"], {
    read: false,
  });

  return target.pipe(inject(sources)).pipe(dest('./src/views'));
}

module.exports = {
  htmlInject,
  compactImage
}
