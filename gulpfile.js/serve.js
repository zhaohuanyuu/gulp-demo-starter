const path = require("path");
const watch = require('gulp-watch');

const scssTask = require("./scss");
const scriptTask = require("./scripts");
const assetsTask = require('./assets');
const browserSync = require("browser-sync").create();
const reload = browserSync.reload;

const viewDir = "./src/views";

function serSync(end) {
  browserSync.init({
    open: false,
    server: {
      baseDir: "./",
    },
    startPath: null,
  });

  watch(`${viewDir}/**/*`, { read: false }, function (vinyl) {
    const { path: route, event: eventType } = vinyl;
    let pathInfo = path.parse(route);
    pathInfo.path = route;
    pathInfo.eventType = eventType;

    switch (pathInfo.ext) {
      case ".html":
        reload();
        break;
      case ".scss":
        scssTask.compileScss(browserSync, pathInfo);
        break;
      case ".js":
        scriptTask.compileJs(browserSync, pathInfo);
        break;
      case ".png":
      case ".jpg":
      case ".jpeg":
        assetsTask.optimizeImage(browserSync, pathInfo);
      default:
        return null;
    }
  });

  end();
}

module.exports = serSync;
