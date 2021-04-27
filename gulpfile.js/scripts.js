const { src, dest } = require("gulp");
const babel = require('gulp-babel');
const concat = require("gulp-concat");
const uglify = require("gulp-uglify");
const sourcemaps = require("gulp-sourcemaps");
const lineec = require("gulp-line-ending-corrector");

const { getOutputReg } = require('./utils');


function compileJs(browserSync, pathInfo) {
  const {
    path,
    dir
  } = pathInfo;
  const outPutReg = getOutputReg();
  const outPutName = dir.match(outPutReg)[1];

  // console.log(`compileJs: ${path}`);

  return (
    src(path)
      .pipe(sourcemaps.init())
      .pipe(
        babel({
          presets: ["@babel/preset-env"],
        })
      )
      // .pipe(uglify())
      .pipe(lineec())
      .pipe(sourcemaps.write("./"))
      .pipe(dest(`./dist/${outPutName}`))
      .pipe(browserSync.stream())
  );
}

function concatJs() {
  return src("../static/**/*.js")
    .pipe(sourcemaps.init())
    .pipe(concat("vendor.min.js"))
    .pipe(uglify())
    .pipe(sourcemaps.write("../dist/js/maps"))
    .pipe(lineec())
    .pipe(dest('../dst/maps'));
}

module.exports = {
  concatJs,
  compileJs
}
