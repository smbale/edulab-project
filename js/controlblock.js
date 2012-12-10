define(['svg', 'block', 'blockgroup', 'connector'],
function (svg, Block, BlockGroup, Connector) {

  /* Control block (if-else, loop) */
  var ControlBlock = function (opts) {
    opts = opts || {};
    this.cnt = opts.cnt || 1;

    /* Call `Block`'s init method */
    this.initMembers(opts);
    this.frame = ControlBlock.createFrame(this.cnt);
    this.wrapper.appendChild(this.frame);

    svg.addClass(this.wrapper, 'control-block');
    
    /* Add icon */
    if (opts.elem) {
      var g = svg.create('g');
      this.wrapper.appendChild(g);
      g.appendChild(opts.elem);
    }

    /* Init connectors */
    this.connectorPositions = [];
    this.connectorGroups = [];
    for (var i = 1; i <= this.cnt; i++) {
      if (i > 0) {
        var bg = new BlockGroup();
        bg.parentBlock = this;
        this.connectorGroups.push(bg);
        this.wrapper.appendChild(bg.wrapper);
      }
    }

    for (var i = 0; i <= this.cnt; i++) {
      this.connectors.push(new Connector(this, i));
      var cpath = Block.connector.cloneNode();
      this.connectorPaths.push(cpath);
      this.connectorPositions.push({x: 0, y: 0});
      cpath.style.display = 'none';
      this.wrapper.appendChild(cpath);
      /* TODO: add `createChildBlockGroup` to `Block` */
    }

    this.updateSize = function () {
      /* Update other connectors */
      var h = 0;
      for (var i = 1; i <= this.cnt; i++ ) {
        h += ControlBlock.CONTROL_MIN_HEIGHT;
        /* TODO: hard-coded 15 */
        svg.setTranslate(this.connectorPaths[i], 15, h);
        this.connectorPositions[i].x = 15;
        this.connectorPositions[i].y = h;
        this.connectorGroups[i - 1].translate(15, h);
        var gheight = this.connectorGroups[i - 1].size().height;
        gheight -= Block.CONNECTOR_HEIGHT;
        this.setSegmentHeight(i, gheight);
        if (ControlBlock.SEGMENT_MIN_HEIGHT < gheight) {
          h += gheight;
        } else {
          h += ControlBlock.SEGMENT_MIN_HEIGHT;
        }
      }

      var segs = this.frame.pathSegList;
      segs.replaceItem(Block.relLineTo(0, h + ControlBlock.END_SEGMENT_HEIGHT -
                                          2 * Block.CORNER_RADIUS),
                       ControlBlock.HEIGHT_IND);

      /* Update main connector */
      var size = this.size();
      svg.setTranslate(this.connectorPaths[0], 0, size.height);
      this.connectorPositions[0].y = size.height;
    };

    this.setSegmentHeight = function (i, height) {
      // TODO: properly implement
      var segs = this.frame.pathSegList;
      if (height < ControlBlock.SEGMENT_MIN_HEIGHT) {
        height = ControlBlock.SEGMENT_MIN_HEIGHT;
      }
      segs.replaceItem(Block.relLineTo(0, -height + 2*Block.CORNER_RADIUS),
                       ControlBlock.RIGHT_HIGHT_IND);
    };

    /* Returns size of the block {width, height} */
    this.size = function () {
      /* FireFox fails to return BBox if element is not attached to DOM */
      var e, height, width;
      try {
        var bbox = this.wrapper.getBBox();
        height = bbox.height - Block.CONNECTOR_HEIGHT;
        width = bbox.width;
      } catch (e) {
        height = 0;
        width = 0;
      }
      var min_width = Block.MIN_WIDTH + Block.CONNECTOR_TOTAL_WIDTH,
          min_height = ControlBlock.END_SEGMENT_HEIGHT + 
                       this.cnt * (ControlBlock.SEGMENT_MIN_HEIGHT +
                                   ControlBlock.CONTROL_MIN_HEIGHT);
      return {
        height: height < min_height ? min_height : height,
        width : width  < min_width  ? min_width  : width
      };
    };

    this.connectorArea = function (index) {
      if (typeof(index) === 'undefined') {
        return Block.prototype.connectorArea.call(this);
      } else if (index === 0) {
        /* Main connector */
        return Block.prototype.connectorArea.call(this, index);
      } else if (index > 0) {
        /* Return the connector's area with which this one connects */
        var pos = this.globalPosition();
        return {
          x: this.connectorPositions[index].x + pos.x,
          y: this.connectorPositions[index].y + pos.y,
          width: Block.CONNECTOR_TOTAL_WIDTH,
          height: Block.CONNECTOR_HEIGHT + 10         /* 5px below connector */
        };
      }
    };

    this.connect = function (block, index) {
      if (index === 0) {
        Block.prototype.connect.call(this, block, index);
      } else {
        this.connectorGroups[index - 1].prependChain(block);
      }
    };

    /* TODO: move this to Block */
    this.onHoverStart = function (block, index) {
      this.connectorPaths[index].style.display = 'block';
    }

    this.onHoverEnd = function (block, index) {
      this.connectorPaths[index].style.display = 'none';
    }

    this.attachable = function (block) {
      var groups = this.connectorGroups,
          connector = null;
      for (var i = 0, length = groups.length; i < length; i++) {
        connector = groups[i].attachable(block);
        if (connector) return connector;
      }
      return Block.prototype.attachable.call(this, block);
    };

  };

  ControlBlock.prototype = Block.prototype;

  /* Frame visuals */

  ControlBlock.END_SEGMENT_HEIGHT = 15;
  ControlBlock.SEGMENT_MIN_HEIGHT = 30;
  ControlBlock.CONTROL_MIN_HEIGHT = 60;
  ControlBlock.SEGMENT_WIDTH = 30;
  ControlBlock.SEGMENT_TOTAL_WIDTH = 
    ControlBlock.SEGMENT_WIDTH + Block.CONNECTOR_TOTAL_WIDTH;

  ControlBlock.createFrame = function (cnt) {
    var path = Block.frame.cloneNode(),
        segs = path.pathSegList,
        relLineTo = Block.relLineTo,
        relArcTo  = Block.relArcTo;
    SEGS = segs;

    /* Remove the last segment: close path */
    segs.removeItem(segs.numberOfItems - 1);

    /* Remove height item */
    segs.removeItem(Block.SEG_IND_HEIGHT);

    /* Add height items */
    var height = ControlBlock.END_SEGMENT_HEIGHT + 
                 cnt * (ControlBlock.SEGMENT_MIN_HEIGHT +
                        ControlBlock.CONTROL_MIN_HEIGHT) -
                 2 * Block.CORNER_RADIUS;
    segs.insertItemBefore(relLineTo(0, height), Block.SEG_IND_HEIGHT);
    ControlBlock.HEIGHT_IND = Block.SEG_IND_HEIGHT;

    /* Add height item at the end */
    segs.appendItem(relLineTo(0, -ControlBlock.END_SEGMENT_HEIGHT +
                                 2 * Block.CORNER_RADIUS));

    /* Create all segments */
    for (var i = 0; i < cnt; i++) {
      /* Bottom right arc */
      segs.appendItem(relArcTo(-Block.CORNER_RADIUS, -Block.CORNER_RADIUS));

      /* Bottom width */
      segs.appendItem(relLineTo(-ControlBlock.SEGMENT_WIDTH, 0));

      /* Bottom connector */
      segs.appendItem(relLineTo(-Block.CONNECTOR_MARGIN, 0));
      segs.appendItem(relLineTo(-Block.CONNECTOR_TRANSITION_WIDTH, 
                                -Block.CONNECTOR_HEIGHT));
      segs.appendItem(relLineTo(-Block.CONNECTOR_WIDTH, 0));
      segs.appendItem(relLineTo(-Block.CONNECTOR_TRANSITION_WIDTH,
                                Block.CONNECTOR_HEIGHT));
      segs.appendItem(relLineTo(-Block.CONNECTOR_MARGIN + Block.CORNER_RADIUS, 0));

      /* Bottom left arc */
      segs.appendItem(relArcTo(-Block.CORNER_RADIUS, -Block.CORNER_RADIUS, 1));

      /* Segment height */
      /* TODO: different inds */
      ControlBlock.RIGHT_HIGHT_IND = segs.numberOfItems;
      segs.appendItem(relLineTo(0, -ControlBlock.SEGMENT_MIN_HEIGHT +
                                   2 * Block.CORNER_RADIUS));

      /* Top left arc */
      segs.appendItem(relArcTo(Block.CORNER_RADIUS, -Block.CORNER_RADIUS, 1));

      /* Top connector */
      segs.appendItem(relLineTo(Block.CONNECTOR_MARGIN - Block.CORNER_RADIUS, 0));
      segs.appendItem(relLineTo(Block.CONNECTOR_TRANSITION_WIDTH, 
                                -Block.CONNECTOR_HEIGHT));
      segs.appendItem(relLineTo(Block.CONNECTOR_WIDTH, 0));
      segs.appendItem(relLineTo(Block.CONNECTOR_TRANSITION_WIDTH,
                                Block.CONNECTOR_HEIGHT));
      segs.appendItem(relLineTo(Block.CONNECTOR_MARGIN, 0));

      /* Top width */
      segs.appendItem(relLineTo(ControlBlock.SEGMENT_WIDTH, 0));

      /* Top right arc */
      segs.appendItem(relArcTo(Block.CORNER_RADIUS, -Block.CORNER_RADIUS));

      /* Control height */
      segs.appendItem(relLineTo(0, -ControlBlock.CONTROL_MIN_HEIGHT +
                                   2 * Block.CORNER_RADIUS));
    }

    return path;
  };

  return ControlBlock;
});
