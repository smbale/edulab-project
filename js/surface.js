define(['svg'], function(svg) {
  var svgElement = svg.svgElement;

  /**
   * Surface handles whiteboard view: panning and zooming
   */
  var Surface = function() {
    this._x = 0;
    this._y = 0;
    this._scale = 1;

    this.svg = svgElement('svg', {width:'100%', height:'100%'});

    var transGroup = svgElement('g'),
        scaleGroup = svgElement('g');

    this.canvas = scaleGroup;
    transGroup.appendChild(scaleGroup);
    this.svg.appendChild(transGroup);

    this.transTransforms = transGroup.transform.baseVal;
    this.transTransform = this.svg.createSVGTransform();

    this.scaleTransforms = scaleGroup.transform.baseVal;
    this.scaleTransform = this.svg.createSVGTransform();
  };

  Surface.prototype.translateBy = function(x, y) {
    this.translate(this._x + x, this._y + y);
  };

  Surface.prototype.translate = function(x, y) {
    this._x = x;
    this._y = y;
    this.transTransform.setTranslate(this._x, this._y);
    this.transTransforms.initialize(this.transTransform);
  };

  Surface.prototype.scale = function(s) {
    if (s < 20 && s > 0.05) {
      this._scale = s;
      this.scaleTransform.setScale(s, s);
      this.scaleTransforms.initialize(this.scaleTransform);
    }
  };

  Surface.prototype.scaleBy = function(s) {
    this.scale(s < 0 ? this._scale / (-s) : this._scale * s);
  };

  Surface.prototype.resetView = function() {
    this.translate($(this.svg).width() / 2, $(this.svg).height() / 2);
    this.scale(1);
  };

  Surface.prototype.getRealCoordinates = function(x, y) {
    return [(x - this._x) / this._scale, (y - this._y) / this._scale];
  };

  return Surface;
});
