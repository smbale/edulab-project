define(['svg'], function (svg) {

  var Block = function (opts) {
    opts = opts || {};
    this.fill = opts.fill || 'red';

    this.wrapper = svg.create('g');

    /* Whether block is being dragged or not */ 
    this.dragging = false;

    var circle = svg.create('circle', {
      cx: 50, cy: 50, r: 100, fill: opts.fill || 'red'});

    this.wrapper.appendChild(circle);
  };

  return Block;

});
