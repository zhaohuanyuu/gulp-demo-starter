const path = require("path");
const { watch } = require("gulp");
const scssFns = require("./scss");
const scriptFns = require("./scripts");
const browserSync = require("browser-sync").create();
const reload = browserSync.reload;

const viewDir = "./src/views";
const watcher = watch([
  `${viewDir}/**/*.html`,
  `${viewDir}/**/*.scss`,
  `${viewDir}/**/*.js`,
]);

function serSync(end) {
  browserSync.init({
    open: false,
    server: {
      baseDir: "./",
    },
    startPath: null,
  });

  console.log(reload);

  watcher.on("change", function (route, stats) {
    let pathInfo = path.parse(route);
    pathInfo.path = route;

    switch (pathInfo.ext) {
      case ".html":
        reload();
        break;
      case ".scss":
        scssFns.compileScss(browserSync, pathInfo);
        break;
      case ".js":
        scriptFns.compileJs(browserSync, pathInfo);
        break;
      default:
        return null;
    }
  });

  // watch(`${viewDir}/**/*.html`).on("change", reload);
  // watch(`${viewDir}/**/*.scss`, scssFns.compileScss);
  // watch(`${viewDir}/**/*.js`).on("change", scriptFns.compileJs);
  end();
}

module.exports = serSync;
