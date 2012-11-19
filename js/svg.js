define(function() {
  var exports = {};

  /* Shortcut for creating SVG elements */
  var svgElement = function(name, attrs) {
    attrs = attrs || {};
    var svgns = 'http://www.w3.org/2000/svg';
    var e = document.createElementNS(svgns, name);
    for(var attr in attrs) {
      if (/^xlink:/.test(attr)) {
        e.setAttributeNS('http://www.w3.org/1999/xlink',
                         attr,
                         attrs[attr]);
      } else {
        e.setAttribute(attr, attrs[attr]);
      }
    }
    return e;
  };
  exports.svgElement = svgElement;

  return exports;
});
