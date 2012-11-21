define(['svg'], function (svg) {

  /* `BlockGroup` represents a group of blocks.
   * It keeps track of the first block.
   * Some `BlockGroup`s are global, some are inside of a
   * block (e.g. if-block).
   */
  var BlockGroup = function () {
    var that = this;

    this.wrapper = svg.create('g');

    /* `this.wrapper` can be moved and these transforms
     * are used for translation */
    this.transforms = this.wrapper.transform.baseVal;
    this.transform = svg.createSVGTransform();

    /* position of the block group */
    this._x = 0;
    this._y = 0;

  };

  BlockGroup.prototype.append =  function (block) {
      this.wrapper.appendChild(block.wrapper);
      this.first = block;
      block.group = this;
  };

  /* Translation */

  BlockGroup.prototype.translateBy = function (x, y) {
    this.translate(this._x + x, this._y + y);
  };

  BlockGroup.prototype.translate = function (x, y) {
    this._x = x;
    this._y = y;
    this.transform.setTranslate(this._x, this._y);
    this.transforms.initialize(this.transform);
  };

  return BlockGroup;
});
