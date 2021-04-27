const path = require('path');
const sass = require("gulp-sass");
const { src, dest } = require('gulp');
const concat = require('gulp-concat');
const cleanCss = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const autoPrefixer = require('gulp-autoprefixer');
const lineec = require('gulp-line-ending-corrector');

const { getOutputName } = require('./utils');

// compile scss into css
function compileScss(browserSync, pathInfo) {
  const { path: filePath, dir } = pathInfo;
  const outPutName = getOutputName(dir);

  // console.log(dir, dir.match(outPutReg));
  console.log(`compileScss: ${filePath}`);

  // return src(["./src/scss/**/*.scss", "!./src/scss/common/*.scss"])
  return src(filePath)
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sass({ outputStyle: "nested" }).on("error", sass.logError))
    .pipe(autoPrefixer("last 2 versions"))
    .pipe(sourcemaps.write("./"))
    .pipe(lineec())
    .pipe(dest(`./dist/${outPutName}`))
    .pipe(browserSync.stream());
}

// concat all css in order
function generateCommonCss() {
  return src("./static/css/*.css")
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(concat("common.min.css"))
    .pipe(cleanCss({ level: 2 }))
    .pipe(sourcemaps.write("./"))
    .pipe(lineec())
    .pipe(dest("./dist/css/common/"));
}

module.exports = {
  compileScss,
  generateCommonCss
}
