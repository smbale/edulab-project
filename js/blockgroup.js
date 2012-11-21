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

    /* position of the block group */
    this._x = 0;
    this._y = 0;

    /* set reference for the first block to `null` */
    this.first = null;
  };

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

  return BlockGroup;
});
