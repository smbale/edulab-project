define(function() {

  /* Shortcut for creating SVG elements */
  var create = function(name, attrs) {
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

  /* Export the `svg` element which is used for creating
   * transformations, etc.
   */
  var exports = create('svg');
  exports.create = create;

  return exports;
});
