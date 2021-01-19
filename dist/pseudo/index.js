"use strict";

var _elementStyle = document.createElement("div").style;

var _vendor = function () {
  var vendors = ["t", "webkitT", "MozT", "msT", "OT"],
      transform,
      i = 0,
      l = vendors.length;

  for (; i < l; i++) {
    transform = vendors[i] + "ransform";
    if (transform in _elementStyle) return vendors[i].substr(0, vendors[i].length - 1);
  }

  return false;
}();

console.log(_vendor);
//# sourceMappingURL=index.js.map
