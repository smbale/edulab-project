define(['svg'], function (svg) {

  /* `Block` represents one statement or an expression.
   * `Block` keeps track of the group it belongs to and previous/next
   *  elements in the group.
   */
  var Block = function (opts) {
    opts = opts || {};
    this.fill = opts.fill || 'red';

    this.wrapper = svg.create('g');

    /* Whether block is being dragged or not */ 
    /* TODO: maybe not needed after all */
    this.dragging = false;

    var circle = svg.create('circle', {
      cx: 50, cy: 50, r: 100, fill: opts.fill || 'red'});

    this.wrapper.appendChild(circle);
  };

  return Block;

});
