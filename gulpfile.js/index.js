const tools = require('./tools');
const serSync = require("./serve");
const { htmlInject } = require("./statics");
const { generateCommonCss } = require('./scss');

const { series, parallel } = require("gulp");

const build = parallel(
    serSync,
    series(generateCommonCss, htmlInject)
);

exports.default = build;
exports.mkView = tools.mkView;
