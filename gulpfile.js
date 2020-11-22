const fs = require('fs');
const path = require('path');
const root = './';
const dist = root + 'dist';
const scssDir = path.resolve(root, 'src/scss');
const viewDir = path.resolve(root, 'src/views');
const jsDir = path.resolve(root, 'src/js');
const imgDir = path.resolve(root, 'src/images');

const { src, dest, watch, series, parallel } = require("gulp");
const sass = require("gulp-sass");
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const inject = require('gulp-inject');
const uglify = require('gulp-uglify');
const changed = require('gulp-changed');
const template = require('gulp-template');
const imagemin = require('gulp-imagemin');
const cleanCss = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const autoPrefixer = require('gulp-autoprefixer');
const lineec = require('gulp-line-ending-corrector');
const browserSync = require("browser-sync").create();
const reload = browserSync.reload;

let latestView;

// compile scss into css
function compileScss() {
  return src([scssDir + "/**/*.scss", '!' + scssDir + "/common/*.scss",])
          .pipe(sourcemaps.init({loadMaps: true}))
          .pipe(sass({outputStyle: 'nested'}).on('error', sass.logError))
          .pipe(autoPrefixer('last 2 versions'))
          .pipe(sourcemaps.write('./'))
          .pipe(lineec())
          .pipe(dest(dist + '/css'))
          .pipe(browserSync.stream());
}

// concat all css in order
function generateCommonCss() {
  return src(root + 'static/css/*.css')
          .pipe(sourcemaps.init({loadMaps: true}))
          .pipe(concat('common.min.css'))
          .pipe(cleanCss({level: 2}))
          .pipe(sourcemaps.write('./'))
          .pipe(lineec())
          .pipe(dest(dist + '/css/common/'))
}

function compileJs() {
  return src(jsDir + '/**/*.js')
          .pipe(sourcemaps.init())
          .pipe(babel({
            presets: ['@babel/preset-env']
          }))
          // .pipe(uglify())
          .pipe(lineec())
          .pipe(sourcemaps.write('./'))
          .pipe(dest(dist + '/js/'))
          .pipe(browserSync.stream())
}

function concatJs() {
  return src(root + 'static/**/*.js')
          .pipe(sourcemaps.init())
          .pipe(concat('vendor.min.js'))
          .pipe(uglify())
          .pipe(sourcemaps.write(root + 'maps'))
          .pipe(lineec())
          .pipe(dest(dist))
}

function compactImage() {
  return src(imgDir)
          .pipe(changed(dist + 'images'))
          .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.jpegtran({progressive: true}),
            imagemin.optipng({optimizationLevelL: 5})
          ]))
          .pipe(dest(dist + '/image/'))
}

function htmlInject() {
  const target = src('./src/views/**/*.html');
  const sources = src(['./static/js/**/*.js', './dist/css/common/*.css'], { read: false });

  return target.pipe(inject(sources)).pipe(dest(viewDir))
}

function getFileContent(path) {
  return fs.readFileSync(path, 'utf-8');
}

function mkView(end) {
  const args = process.argv;
  const viewName = args.length > 3 && args[args.length - 1].replace(/--/, '');

  if (!viewName) { 
    throw new Error('view name is required... eg: gulp mkView --xxx')
  }

  const cssCon = getFileContent('./static/template/template.scss');
  const jsCon = getFileContent('./static/template/template.js');
  const htmlCon = getFileContent('./static/template/template.html');

  const writePaths = [
    { path: scssDir, ext: 'scss', con: cssCon},
    { path: jsDir, ext: 'js', con: jsCon },
    { path: viewDir, ext: 'html', con: htmlCon }
  ];

  writePaths.forEach((info, index) => {
    const writeDirName = `${info.path}/${viewName}`;

    fs.mkdir(writeDirName, err => {
      if (err) {
        if (err.code === 'EEXIST') throw new Error('该目录已存在~');
      } else {
        const writeFileName = writeDirName + '/index.' + info.ext;
        fs.writeFile(writeFileName, info.con, err => {
          if (err) {
            throw err;
          } else {
            console.log(`${viewName} > index.${info.ext}创建成功!`);
            
            // 记录最近一次创建页面,启动时终端提示
            if (index === writePaths.length -1 ) {
              latestView = `${viewDir}/${viewName}/index.html`; 
            }

            if (info.ext === 'html') {
              return src(`${viewDir}/${viewName}/index.html`)
                      .pipe(template({ name: viewName }))
                      .pipe(dest(`${viewDir}/${viewName}`))
            }
          }
        })
      }
    })
  })

  end();
}

function init(end) {
  browserSync.init({
    open: false,
    server: {
      baseDir: root,
    },
    startPath: latestView ? `src/${latestView}` : null,
  });

  // watch files change
  watch(scssDir + '/**/*.scss', compileScss);
  watch(viewDir + '/**/*.html').on('change', reload);
  watch(jsDir + '/**/*.js').on('change', compileJs);

  end();
}

const build = series(init, parallel(generateCommonCss, htmlInject));

exports.mkView = mkView;
exports.default = build;
