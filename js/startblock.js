define(['svg', 'block', 'connector'],
function (svg, Block, Connector) {

  /* Special block used for starting */
  var StartBlock = function (opts) {
    opts = opts || {};
    var onrun = opts.onrun || function () {};

    /* Call `Block`'s init method */
    this.initMembers(opts);
    this.frame = StartBlock.frame.cloneNode();
    this.wrapper.appendChild(this.frame);

    svg.addClass(this.wrapper, 'start-block');

    this.connectors.push(new Connector(this, 0));
    
    /* Add icon */
    var icon = svg.create('use', {
      'x': 34,
      'y': 7,
      'class': 'svg-button',
      'xlink:href': '#play-icon'});
    this.wrapper.appendChild(icon);
    $(icon).click(onrun)
           .mousedown(function () {
              return false;
           });

    var cpath = Block.connector.cloneNode();
    this.connectorPaths.push(cpath);
    cpath.style.display = 'none';
    this.wrapper.appendChild(cpath);

    this.updateSize = function () {
      /* Update connector */
      svg.setTranslate(this.connectorPaths[0], 0, this.size().height);
    };

    var size = {width: 2 * StartBlock.ARC_RADIUS,
                height: StartBlock.ARC_RADIUS + Block.CORNER_RADIUS}
    this.size = function () {
      return size;
    };

    this.connectorArea = function (index) {
      if (typeof(index) === 'undefined') {
        return null;
      } else {
        return Block.prototype.connectorArea.call(this, index);
      }
    };

  };

  StartBlock.prototype = Block.prototype;

  /* Creates visual frame appends it to `StartBlock` */
  StartBlock.ARC_RADIUS = (Block.CONNECTOR_TOTAL_WIDTH + Block.MIN_WIDTH) / 2;

  (function (StartBlock) {
   var path = svg.create('path', {
      'stroke-linejoin': 'round',
      'class': 'frame'
    });
    var segs = path.pathSegList;

    var relLineTo = function (x, y) {
      return path.createSVGPathSegLinetoRel(x, y);
    };

    var relArcTo = function (x, y) {
      return path.createSVGPathSegArcRel(
          x,
          y,
          Block.CORNER_RADIUS,
          Block.CORNER_RADIUS,
          90,
          0,
          0);
    };

    /* Starting point */
    segs.appendItem(
      path.createSVGPathSegMovetoAbs(
        2 * StartBlock.ARC_RADIUS,
        StartBlock.ARC_RADIUS));

    segs.appendItem(path.createSVGPathSegArcRel(
          -2 * StartBlock.ARC_RADIUS,
          0,
          StartBlock.ARC_RADIUS,
          StartBlock.ARC_RADIUS,
          180,
          0,
          0));
 
    /* Add left bottom corner arc */
    segs.appendItem(relArcTo(Block.CORNER_RADIUS, Block.CORNER_RADIUS));

    segs.appendItem(relLineTo(Block.CONNECTOR_MARGIN - Block.CORNER_RADIUS, 0));
    segs.appendItem(relLineTo(Block.CONNECTOR_TRANSITION_WIDTH, 
                              -Block.CONNECTOR_HEIGHT));
    segs.appendItem(relLineTo(Block.CONNECTOR_WIDTH, 0));
    segs.appendItem(relLineTo(Block.CONNECTOR_TRANSITION_WIDTH,
                              Block.CONNECTOR_HEIGHT));
    segs.appendItem(relLineTo(Block.CONNECTOR_MARGIN, 0));

    /* Finish bottom line */
    segs.appendItem(path.createSVGPathSegLinetoAbs(
          2 * StartBlock.ARC_RADIUS - Block.CORNER_RADIUS,
          StartBlock.ARC_RADIUS + Block.CORNER_RADIUS));

    /* Add right bottom corner arc */
    segs.appendItem(relArcTo(Block.CORNER_RADIUS, -Block.CORNER_RADIUS));
    StartBlock.frame = path;
  })(StartBlock);

  return StartBlock;
});
