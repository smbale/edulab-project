define(['svg'], function (svg) {

  /* `Block` represents one statement or an expression.
   * `Block` keeps track of the group it belongs to and previous/next
   *  elements in the group.
   */
  var Block = function (opts) {
    opts = opts || {};

    this.wrapper = svg.create('g', {'class': 'block'});

    /* Create frame and append them to `this.wrapper` */
    this.frame = Block.frame.cloneNode();
    this.wrapper.appendChild(this.frame);
    
    /* Set fill of the frame */
    this.frame.style.fill = 'hsl(60, 85%, 50%)';

    this.frame.style.filter = 'url(#inner-shadow)';

    /* Add text */
    var text = svg.create('text', {
      'x': 10,
      'y': 43,
      'font-family': 'sans-serif',
      'font-size': 40,
      'style': '-webkit-svg-shadow: 1px 1px rgba(0,0,0,0.8)',
      'fill': 'hsl(220, 100%, 76%)'
    });
    text.textContent = opts.text || 'A';
    this.wrapper.appendChild(text);

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
   * It calls `remove()` on `block,
   * updates `block`'s group,
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

  /* Updates position and size.
   * Recursively calls update in the chain. */
  Block.prototype.update = function () {
    if (this.prev) {
      this.translate(0, this.prev._y + this.prev.height());
    } else {
      this.translate(0, 0);
    }
    return this.next ? this.next.update() : null;
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

  /* Returns height of the block */
  Block.prototype.height = function () {
    /* FireFox fails to return BBox */
    var e;
    try {
      var height = this.wrapper.getBBox().height - Block.CONNECTOR_HEIGHT;
    } catch (e) {
      var height = 0;
    }
    return height < Block.MIN_HEIGHT ? Block.MIN_HEIGHT : height;
  };

  /* Returns width of the block */
  Block.prototype.width = function () {
    var e;
    try {
      var width = this.wrapper.getBBox().width;
    } catch (e) {
      var width = 0;
    }
    var min_width = Block.MIN_WIDTH + Block.CONNECTOR_TOTAL_WIDTH;

    return width < min_width ? min_width : width;
  };

  /* Checks if `block` is attachable to this block.
   * Returns the attachee to which `block` is attachable or null. */
  Block.prototype.attachable = function (block) {
    var tbbox = this.wrapper.getBBox(),
        bbbox = block.wrapper.getBBox(),
        x = this._x + this.group._x,
        y = this._y + this.group._y;
    if (svg.rectsIntersect(
          {x: x, y: y, width: tbbox.width, height: tbbox.height},
          {x: block.group._x, y: block.group._y,
           width: bbbox.width, height: bbbox.height})) {
      return this;
    } else {
      return null;
    }
  };

  /* Changes style of the block to show that an attachable
   * block is hovering over this one.
   */
  Block.prototype.onHoverStart = function () {
    this.frame.style.strokeWidth = 3;
  }

  /* Reverts the effect of `onHoverStart()`. */
  Block.prototype.onHoverEnd = function () {
    this.frame.style.strokeWidth = 0.8;
  }

  /* Changes style of the block to show that the block is
   * being dragged.
   */
  Block.prototype.onDragStart = function () {
    this.group.wrapper.style.opacity = 0.95;
  }

  /* Reverts the effect of `onDragStart()`.  */
  Block.prototype.onDragEnd = function () {
    this.group.wrapper.style.opacity = 1;
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
      'stroke': '#666',
      'stroke-width': 0.8,
      'fill': '#D43',
      'stroke-linejoin': 'round'
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

    SEGS = segs;

    /* Create attribute and append to the `Block.frame` */
    Block.frame = path;
  })(Block);

  return Block;

});
