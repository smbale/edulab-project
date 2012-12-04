define(['svg', 'connector'], function (svg, Connector) {

  /* `Block` represents one statement or an expression.
   * `Block` keeps track of the group it belongs to and previous/next
   *  elements in the group.
   */
  var Block = function (opts) {
    opts = opts || {};

    this.initMembers();

    svg.addClass(this.wrapper, "statement-block");

    /* Create frame and append them to `this.wrapper` */
    this.frame = Block.frame.cloneNode();
    this.wrapper.appendChild(this.frame);

    /* Add text */
    if (opts.text) {
      var text = svg.create('text', {
        'x': 10,
        'y': 43,
        'font-family': 'sans-serif',
        'font-size': 40,
        'filter': 'url(#simple-shadow)',
        'fill': 'white'
      });
      text.textContent = opts.text;
      this.wrapper.appendChild(text);
    } else {
      this.wrapper.appendChild(svg.create('use', {
        'x': 6,
        'y': 7,
        'xlink:href': '#loop-icon'}));
    }

    this.connectors.push(new Connector(this, 0));

    var cpath = Block.connector.cloneNode();
    this.connectorPaths.push(cpath);
    cpath.style.display = 'none';
    this.wrapper.appendChild(cpath);
  };

  Block.prototype.initMembers = function () {
    this.wrapper = svg.create('g', {'class': 'block'});

    /* Position of the block */
    this.transforms = this.wrapper.transform.baseVal;
    this.transform = svg.createSVGTransform();
    this._x = 0;
    this._y = 0;
    
    /* `BlockGroup` to which the block belongs */
    this.group = null;

    /* previous and next elements in a group */
    this.prev = null;
    this.next = null;

    /* Connectors */
    this.connectors = [];
    this.connectorPaths = [];
  };

  /* Check if the block belongs to some group. */
  Block.prototype.hasGroup = function () {
    return this.group !== null;
  };

  /* Checks if the block is the first in his group.
   * Returns false if it doesn't have a group. */
  Block.prototype.isFirst = function () {
    return this.hasGroup() ? this.group.first === this : false;
  };

  /* Checks if the block is the last in his group.
   * Returns false if it doesn't have a group. */
  Block.prototype.isLast = function () {
    return this.hasGroup() ? this.next === null : false;
  };

  /* Returns the last block in chain. */
  Block.prototype.lastInChain = function () {
    return this.next ? this.next.lastInChain() : this;
  };

  /* Removes the block from his group and/or his chain.
   * Correctly updates his and neighbours' `prev`/`next` references,
   * and the group's `first` reference.
   * Calls update on the next block.
   * Removes `wrapper` element from the parent.
   */
  Block.prototype.remove = function () {
    if (this.isFirst()) {
      this.group.first = this.next;
      if (this.next) this.next.prev = null;
    } else {
      if (this.prev) this.prev.next = this.next;
      if (this.next) this.next.prev = this.prev;
    }
    this.prev = null;
    if (this.next) this.next.update();
    this.next = null;
    if (this.hasGroup()) {
      this.wrapper.parentNode.removeChild(this.wrapper);
      this.group = null;
    }
  };

  /* Removes the chain from this group.
   * Similar to `remove`.*/
  Block.prototype.removeChain = function () {
    if (this.isFirst()) {
      this.group.first = null;
    }

    if (this.prev) this.prev.next = null;
    this.prev = null;

    /* remove all blocks' wrappers from parent element */
    if (this.hasGroup()) {
      for (var b = this; b !== null; b = b.next) {
        b.wrapper.parentNode.removeChild(b.wrapper);
        b.group = null;
      }
    }
  };

  /* Appends `block` after this block.
   * It calls `remove()` on `block, updates `block`'s group,
   * and moves `block.wrapper` element. */
  Block.prototype.append = function (block) {
    block.remove();

    if (this.next) {
      block.next = this.next;
      this.next.prev = block;
    }
    block.prev = this;
    this.next = block;
    if (this.hasGroup()) {
      this.group.wrapper.insertBefore(block.wrapper, this.wrapper);
      block.group = this.group;
      block.update();
    }
  };

  /* Appends the whole chain. */
  Block.prototype.appendChain = function (block) {
    block.removeChain();

    /* First append wrappers into group's element */
    if (this.hasGroup()) {
      this.group.wrapper.insertBefore(block.wrapper, this.wrapper);
      block.group = this.group;

      for (var b = block.next; b !== null; b = b.next) {
        this.group.wrapper.insertBefore(b.wrapper, b.prev.wrapper);
        b.group = this.group;
      }
    }

    var last = block.lastInChain();
    if (this.next) {
      this.next.prev = last;
      last.next = this.next;
    }
    block.prev = this;
    this.next = block;
    if (this.hasGroup()) block.update();
  };

  /* Recursively calls update in the chain. */
  Block.prototype.update = function () {
    this.updatePosition();
    this.updateSize();

    if (this.next) {
      this.next.update();
    } else {
      /* If this is the last block in the chain, call update on parent */
      if (this.hasGroup()) this.group.update();
    }
  };

  /* Updates the position of the block. */
  Block.prototype.updatePosition = function () {
    if (this.prev) {
      this.translate(0, this.prev._y + this.prev.size().height);
    } else {
      this.translate(0, 0);
    }
  };

  /* Updates the size (frame, connectors) of the block. */
  Block.prototype.updateSize = function () {
    /* Update connector */
    svg.setTranslate(this.connectorPaths[0], 0, this.size().height);
  };

  /* Connects `block`'s chain to the connector with index `index` */
  Block.prototype.connect = function (block, index) {
    if (index === 0) {
      this.appendChain(block);
    }
  };

  /* Translates `wrapper` by `x`, `y`. */
  Block.prototype.translateBy = function (x, y) {
    this.translate(this._x + x, this._y + y);
  };

  /* Translates `wrapper` to `x`, `y`. */
  Block.prototype.translate = function (x, y) {
    this._x = x;
    this._y = y;
    this.transform.setTranslate(this._x, this._y);
    this.transforms.initialize(this.transform);
  };

  /* Returns size of the block {width, height} */
  Block.prototype.size = function () {
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
    var min_width = Block.MIN_WIDTH + Block.CONNECTOR_TOTAL_WIDTH;
    return {
      height: height < Block.MIN_HEIGHT ? Block.MIN_HEIGHT : height,
      width : width  < min_width        ? min_width        : width
    };
  };

  /* Return global position of the block */
  Block.prototype.globalPosition = function () {
    var groupPosition = this.group.globalPosition();
    return {
      x: this._x + groupPosition.x,
      y: this._y + groupPosition.y
    };
  };

  /* Returns rectangle {x, y, width, height} with global coordinates
   * for the connector with index `index` or 
   * connecting connecotr if `index` is not given.
   */
  Block.prototype.connectorArea = function (index) {
    var position = this.globalPosition();
    if (typeof(index) !== 'undefined') {
      /* Return the connector's area to which others connect */
      var size = this.size();
      return {
        x: position.x,
        y: position.y + size.height - Block.CONNECTOR_HEIGHT - 5,
        width: Block.CONNECTOR_TOTAL_WIDTH,
        height: Block.CONNECTOR_HEIGHT + 10
      };
    } else {
      /* Return the connector's area with which this one connects */
      return {
        x: position.x,
        y: position.y - Block.CONNECTOR_HEIGHT - 5, /* 5px above connector */
        width: Block.CONNECTOR_TOTAL_WIDTH,
        height: Block.CONNECTOR_HEIGHT + 10         /* 5px below connector */
      };
    }
  };

  /* Checks if `block` is attachable to this block.
   * Returns the connector to which `block` is attachable or null. */
  Block.prototype.attachable = function (block) {
    for (var i = 0, length = this.connectors.length; i < length; i++) {
      var c = this.connectors[i].attachable(block);
      if (c) return c;
    }
    return null;
  };

  /* Changes style of the block to show that an attachable
   * block is hovering over this one.
   */
  Block.prototype.onHoverStart = function () {
    this.connectorPaths[0].style.display = 'block';
  }

  /* Reverts the effect of `onHoverStart()`. */
  Block.prototype.onHoverEnd = function () {
    this.connectorPaths[0].style.display = 'none';
  }

  /* Changes style of the block to show that an attachable
   * block is hovering over this one.
   */
  Block.prototype.onConnect = function (index) {
    // pass
  }

  /* Changes style of the block to show that the block is
   * being dragged.
   */
  Block.prototype.onDragStart = function () {
    svg.addClass(this.group.wrapper, 'dragging');
  }

  /* Reverts the effect of `onDragStart()`.  */
  Block.prototype.onDragEnd = function () {
    svg.removeClass(this.group.wrapper, 'dragging');
  }

  /* Some `Block` constants which determine the visual appearance */
  /* Connector: __/===\__ */
  Block.CONNECTOR_WIDTH = 20;
  Block.CONNECTOR_MARGIN = 12;
  Block.CONNECTOR_TRANSITION_WIDTH = 5;
  Block.CONNECTOR_TOTAL_WIDTH = Block.CONNECTOR_WIDTH + 2*Block.CONNECTOR_MARGIN
                                + 2*Block.CONNECTOR_TRANSITION_WIDTH;
  Block.CONNECTOR_HEIGHT = 5;
  Block.CORNER_RADIUS = 5;
  Block.MIN_HEIGHT = 60;
  Block.MIN_WIDTH = 50; /* Not counting the connector width */

  /* Creates visual frame and appends it to `Block` */
  (function (Block) {
    /*       /======\
     *  |====        =========| <- start from here
     *  |                     |
     *  |    /======\         |
     *  |====        =========| <- close path here
     *
     */
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
        Block.CONNECTOR_TOTAL_WIDTH + Block.MIN_WIDTH,
        Block.CORNER_RADIUS));

    /* Add right top corner arc */
    segs.appendItem(relArcTo(-Block.CORNER_RADIUS, -Block.CORNER_RADIUS));

    /* Index of the segment for the top border */
    Block.SEG_IND_WIDTH_TOP = segs.numberOfItems;
    segs.appendItem(relLineTo(-Block.MIN_WIDTH + Block.CORNER_RADIUS, 0));

    segs.appendItem(relLineTo(-Block.CONNECTOR_MARGIN, 0));
    segs.appendItem(relLineTo(-Block.CONNECTOR_TRANSITION_WIDTH, 
                              -Block.CONNECTOR_HEIGHT));
    segs.appendItem(relLineTo(-Block.CONNECTOR_WIDTH, 0));
    segs.appendItem(relLineTo(-Block.CONNECTOR_TRANSITION_WIDTH,
                              Block.CONNECTOR_HEIGHT));
    segs.appendItem(relLineTo(-Block.CONNECTOR_MARGIN + Block.CORNER_RADIUS, 0));

    /* Add left top corner arc */
    segs.appendItem(relArcTo(-Block.CORNER_RADIUS, Block.CORNER_RADIUS));

    /* Index of the segment for the left border */
    Block.SEG_IND_HEIGHT = segs.numberOfItems;
    segs.appendItem(relLineTo(0, Block.MIN_HEIGHT - 2*Block.CORNER_RADIUS));

    /* Add left bottom corner arc */
    segs.appendItem(relArcTo(Block.CORNER_RADIUS, Block.CORNER_RADIUS));

    segs.appendItem(relLineTo(Block.CONNECTOR_MARGIN - Block.CORNER_RADIUS, 0));
    segs.appendItem(relLineTo(Block.CONNECTOR_TRANSITION_WIDTH, 
                              -Block.CONNECTOR_HEIGHT));
    segs.appendItem(relLineTo(Block.CONNECTOR_WIDTH, 0));
    segs.appendItem(relLineTo(Block.CONNECTOR_TRANSITION_WIDTH,
                              Block.CONNECTOR_HEIGHT));
    segs.appendItem(relLineTo(Block.CONNECTOR_MARGIN, 0));

    /* Index of the segment for the bottom border */
    Block.SEG_IND_WIDTH_BOTTOM = segs.numberOfItems;
    segs.appendItem(relLineTo(Block.MIN_WIDTH - Block.CORNER_RADIUS, 0));

    /* Add right bottom corner arc */
    segs.appendItem(relArcTo(Block.CORNER_RADIUS, -Block.CORNER_RADIUS));

    /* Close path */
    segs.appendItem(path.createSVGPathSegClosePath());

    /* Create attribute and append to `Block.frame` */
    Block.frame = path;


    /* Create connector path (only half margin) */
    var connectorPath = svg.create('path', {
      'class': 'connector'
    });
    segs = connectorPath.pathSegList;

    segs.appendItem(path.createSVGPathSegMovetoAbs(0, 0));

    segs.appendItem(
        path.createSVGPathSegMovetoRel(Block.CONNECTOR_MARGIN / 2 , 0));
    segs.appendItem(relLineTo(Block.CONNECTOR_MARGIN / 2, 0));
    segs.appendItem(relLineTo(Block.CONNECTOR_TRANSITION_WIDTH,
                              -Block.CONNECTOR_HEIGHT));
    segs.appendItem(relLineTo(Block.CONNECTOR_WIDTH, 0));
    segs.appendItem(relLineTo(Block.CONNECTOR_TRANSITION_WIDTH,
                              Block.CONNECTOR_HEIGHT));
    segs.appendItem(relLineTo(Block.CONNECTOR_MARGIN / 2, 0));

    Block.connector = connectorPath;

  })(Block);

  return Block;

});
