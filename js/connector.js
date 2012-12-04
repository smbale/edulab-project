define(['svg'],
function (svg) {

  /* `Connector` represents connecting point.
   * Each block has one or more connectors which are distinguished
   * by their index.
   * Connector only delegates action to the block.
   */
  var Connector = function (block, index) {
    this.block = block;
    this.index = index;
  };

  Connector.prototype.onHoverStart = function (block) {
    this.block.onHoverStart(block, this.index);
  };

  Connector.prototype.onHoverEnd = function (block) {
    this.block.onHoverEnd(block, this.index);
  };

  Connector.prototype.onConnect = function (block) {
    this.block.onConnect(block, this.index);
  };

  Connector.prototype.appendChain = function (block) {
    this.block.connect(block, this.index);
  };

  Connector.prototype.attachable = function (block) {
    var area1 = block.connectorArea(),
        area2 = this.block.connectorArea(this.index);
    return svg.rectsIntersect(area1, area2) ? this : null;
  };

  return Connector;
});
