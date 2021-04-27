const { series, parallel } = require("gulp");

const { mkView } = require('./utils');
const serveSync = require("./serve");
const { generateCommonCss } = require('./scss');

exports.default = serveSync;
exports.mkView = series(generateCommonCss, mkView);
