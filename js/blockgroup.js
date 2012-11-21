define(['svg'], function (svg) {

  var BlockGroup = function () {
    var that = this;

    this.wrapper = svg.create('g');

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
