/**
 * Tools are used to manipulate Surface (pan and zoom)
 * and Turtle (clear)
 */
define([], function () {

  /* Mouse Tool */
  var MouseTool = function(surface) {
    var mousePressed = false, mouseOut = true;
    var x = 0, y = 0; // for calculating delta move

    // disable text select
    var elem = surface.svg;
    elem.onselectstart = function() {
      return false;
    };
    elem.unselectable = 'on';
    elem.style.MozUserSelect = 'none';

    // zoom controls
    var onMouseWheel = function(e) {
      e = e || window.event;
      var delta = e.wheelDelta ? e.wheelDelta/120 : -(e.detail/3);
      if (delta) {
        var x2 = e.offsetX || e.layerX,
            y2 = e.offsetY || e.layerY;
        var coord = surface.getRealCoordinates(x2, y2);
        surface.scaleBy(delta < 0 ? -1.1 : 1.1, coord[0], coord[1]);
        var coord2 = surface.getRealCoordinates(x2, y2);
        surface.translateBy((coord2[0] - coord[0]) * surface._scale,
                            (coord2[1] - coord[1]) * surface._scale);
      }
      if (e.preventDefault) e.preventDefault();
      e.returnValue = false;
      return false;
    };
    
    if (elem.addEventListener) {
      elem.addEventListener('mousewheel', onMouseWheel, false);
      elem.addEventListener('DOMMouseScroll', onMouseWheel, false);
    } else {
      elem.onmousewheel = onMouseWheel;
    }

    // pan controls
    $(elem).mousedown(function(e) {
      mousePressed = true;
      x = e.clientX;
      y = e.clientY;
      $(this).addClass('dragging');
    });

    $(elem).mouseup(function(e) {
      mousePressed = false;
      $(this).removeClass('dragging');
    });

    $(elem).mouseout(function(e) {
      mouseOut = true;
      $(this).removeClass('dragging');
    });

    $(elem).mousemove(function(e) {
      if(!mousePressed) return false;
      var x2 = e.clientX,
          y2 = e.clientY;
      surface.translateBy(x2 - x, y2 - y);
      x = x2;
      y = y2;
      mouseOut = false;
      return false;
    });

    $(document).mouseup(function(e) {
      mousePressed = false;
      $(this).removeClass('dragging');
      return true;
    });
  }

  return MouseTool;
});

