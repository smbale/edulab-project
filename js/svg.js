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

  /* Checks if two rectangles intersect. */
   var rectsIntersect = function (a, b) {
    /* x, y are 'centers' of rectangles,
     * w, h are 'radii' of rectangles.
     */
 //   console.log(a, b);
    var w1 = a.width/2, h1 = a.height/2,
        x1 = a.x + w1, y1 = a.y + h1,
        w2 = b.width/2, h2 = b.height/2,
        x2 = b.x + w2, y2 = b.y + h2;
    return (Math.abs(x1 - x2) < w1 + w2) && (Math.abs(y1 - y2) < h1 + h2);
  };

  /* Export the `svg` element which is used for creating
   * transformations, etc.
   */
  var exports = create('svg');
  exports.create = create;
  exports.rectsIntersect = rectsIntersect;

  return exports;
});
