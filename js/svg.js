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
   * transformations, etc. */
  var svg = create('svg');
  svg.create = create;

  /* Checks if two rectangles intersect. */
  svg.rectsIntersect = function (a, b) {
    /* x, y are 'centers' of rectangles,
     * w, h are 'radii' of rectangles.
     */
    var w1 = a.width/2, h1 = a.height/2,
        x1 = a.x + w1, y1 = a.y + h1,
        w2 = b.width/2, h2 = b.height/2,
        x2 = b.x + w2, y2 = b.y + h2;
    return (Math.abs(x1 - x2) < w1 + w2) && (Math.abs(y1 - y2) < h1 + h2);
  };

  /* Checks if an SVG element `e` has a class `name` */
  svg.hasClass = function (e, name) {
    if (e.classList) {
      return e.classList.contains(name);
    } else {
      return new RegExp('(\\s|^)' + name + '(\\s|$)').test(e.className.baseVal);
    }
  };

  /* Adds a class to an SVG element. */
  svg.addClass = function addClass(e, name) {
    if (e.classList) {
      e.classList.add(name);
    } else if (!svg.hasClass(e, name)) {
      e.className.baseVal += (e.className.baseVal ? ' ' : '') + name;
    }
  };

  /* Removes a class from an SVG element. */
  svg.removeClass = function (e, name) {
    if (e.classList) {
      e.classList.remove(name);
    } else if (svg.hasClass(e, name)) {
      e.className.baseVal = 
        e.className.baseVal
                   .replace(new RegExp('(\\s|^)' + name + '(\\s|$)'), ' ')
                   .replace(/^\s+|\s+$/g, '');
    }
  };

  svg.setTranslate = function (e, x, y) {
    var trans = svg.createSVGTransform();
    trans.setTranslate(x, y);
    e.transform.baseVal.initialize(trans);
  };

  return svg;
});
