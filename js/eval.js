define([], function() {
  var exports = {};

  exports.createEval = function (startBlock) {
    return function (robot) {
      window.ROBOT= robot;
      startBlock.data.eval(robot, startBlock);
    };
  };

  exports.evalStatement = function (robot, block) {
    if (block.data.statement === 'drive') {
      console.log(robot.state);
      robot.drive(2);
    } else if (block.data.statement === 'turn-left') {
      robot.turnLeft(90);
    }
    if (block.next) block.next.data.eval(robot, block.next);
  };

  exports.evalLoop = function (robot, block) {
    var cnt = block.data.cnt;
    while (cnt--) {
      var b = block.connectorGroups[0].first;
      if (b) b.data.eval(robot, b);
    }
    if (block.next) block.next.data.eval(robot, block.next);
  };

  return exports;
});
