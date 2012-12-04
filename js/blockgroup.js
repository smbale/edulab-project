define(['svg'], function (svg) {

  /* `BlockGroup` represents a group of blocks.
   * It keeps track of the first block.
   * Some `BlockGroup`s are global, some are inside of a
   * block (e.g. if-block).
   */
  var BlockGroup = function () {
    var that = this;

    this.wrapper = svg.create('g', {'class': 'blockGroup'});

    /* `this.wrapper` can be moved and these transforms
     * are used for translation */
    this.transforms = this.wrapper.transform.baseVal;
    this.transform = svg.createSVGTransform();

    /* Position of the block group */
    this._x = 0;
    this._y = 0;

    /* Set reference for the first block to `null` */
    this.first = null;

    /* Parent block of the group, `null` if global */
    this.parentBlock = null;
  };

  /* Returns whether the group is empty. */
  BlockGroup.prototype.empty = function () {
    return this.first === null;
  };

  /* Appends `block` to the end.
   * If empty, `block` is set as the first one.
   */
  BlockGroup.prototype.append = function (block) {
    block.remove();
    if (this.empty()) {
      this.first = block;
      block.group = this;
      this.wrapper.appendChild(block.wrapper);
      block.update();
    } else {
      var last = this.first.lastInChain();
      last.append(block);
    }
  };

  /* Appends the whole chain to the end. */
  BlockGroup.prototype.appendChain = function (block) {
    block.removeChain();

    if (block.next === null) {
      this.append(block);
    } else if (this.empty()) {
      var next = block.next;
      block.remove();
      this.append(block);
      block.appendChain(next);
    } else {
      this.first.appendChain(block);
    }
  };

  /* Translates `wrapper` by `x`, `y`. */
  BlockGroup.prototype.translateBy = function (x, y) {
    this.translate(this._x + x, this._y + y);
  };

  /* Translates `wrapper` to `x`, `y`. */
  BlockGroup.prototype.translate = function (x, y) {
    this._x = x;
    this._y = y;
    this.transform.setTranslate(this._x, this._y);
    this.transforms.initialize(this.transform);
  };

  /* Checks if `block` is attachable to some block.
   * Returns the block to which is attachable or null. */
  BlockGroup.prototype.attachable = function (block) {
    var pos = this.globalPosition(),
        size = this.size(),
        area = {x: pos.x, y: pos.y, width: size.width, height: size.height},
        connectorArea = block.connectorArea();
    if (connectorArea === null) return null;
    if (svg.rectsIntersect(area, connectorArea)){
      for (var b = this.first; b !== null; b = b.next) {
        var attachee = b.attachable(block);
        if (attachee) return attachee;
      }
    }
    return null;
  };

  /* Returns the global position of the group. */
  BlockGroup.prototype.globalPosition = function () {
    if (this.parentBlock) {
      var parentPosition = this.parentBlock.globalPosition();
      return {x: this._x + parentPosition.x, y: this._y + parentPosition.y};
    } else {
      return {x: this._x, y: this._y};
    }
  };

  /* Returns the size of the group {width, height} */
  BlockGroup.prototype.size = function () {
    /* FireFox fails to return BBox if element is not attached to DOM */
    var e, height, width;
    try {
      var bbox = this.wrapper.getBBox();
      height = bbox.height;
      width = bbox.width;
    } catch (e) {
      height = 0;
      width = 0;
    }
    return {width: width, height: height};
  };

  /* Delegates update to the parent block */
  BlockGroup.prototype.update = function () {
    if (this.parentBlock) this.parentBlock.update();
  };

  return BlockGroup;
});
