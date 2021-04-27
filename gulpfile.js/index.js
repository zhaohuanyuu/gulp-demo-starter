const { series, parallel } = require("gulp");

const { mkView } = require('./utils');
const serveSync = require("./serve");
const { htmlInject } = require("./assets");
const { generateCommonCss } = require('./scss');

const build = parallel(
    serveSync,
    series(generateCommonCss, htmlInject)
);

exports.default = build;
exports.mkView = mkView;
