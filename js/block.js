define(['svg'], function (svg) {

  /* `Block` represents one statement or an expression.
   * `Block` keeps track of the group it belongs to and previous/next
   *  elements in the group.
   */
  var Block = function (opts) {
    opts = opts || {};
    this.fill = opts.fill || 'red';

    this.wrapper = svg.create('g', {'class': 'block'});

    /* Whether block is being dragged or not */ 
    /* TODO: maybe not needed after all */
    this.dragging = false;

    this.circle = svg.create('circle', {
      cx: 50, cy: 50, r: 50, fill: opts.fill || 'red', strokeWidth: 5});

    this.wrapper.appendChild(this.circle);

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
      this.wrapper.parentElement.removeChild(this.wrapper);
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
        b.wrapper.parentElement.removeChild(b.wrapper);
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
      // TODO: append after this!
      this.group.wrapper.appendChild(block.wrapper);
      block.group = this.group;
      block.update();
    }
  };

  /* Appends the whole chain. */
  Block.prototype.appendChain = function (block) {
    block.removeChain();

    // first append wrappers into group's element */
    if (this.hasGroup()) {
      for (var b = block; b !== null; b = b.next) {
        // TODO: append after this
        this.group.wrapper.appendChild(b.wrapper);
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
//    console.log("update: ", this.prev.wrapper.getBBox(), this);
      this.translate(0, 100 + this.prev._y);
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
    return this.wrapper.getBBox().height;
  };

  /* Returns width of the block */
  Block.prototype.height = function () {
    return this.wrapper.getBBox().width;
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
    this.circle.style.stroke = 'black';
    this.circle.style.strokeWidth = 5;
  }

  /* Reverts the effect of `onHoverStart()`. */
  Block.prototype.onHoverEnd = function () {
    this.circle.style.stroke = 'none';
  }

  return Block;

});
