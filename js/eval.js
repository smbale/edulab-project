define([], function() {
  var exports = {};

  exports.createEval = function (startBlock) {
    return function (robot) {
      window.ROBOT= robot;
      startBlock.data.eval(robot, startBlock);
    };
  };

  var _drive = function (robot, dist) {
    var rows = robot.state.rows,
        cols = robot.state.columns,
        x    = robot.robotX,
        y    = robot.robotY,
        ang  = robot.robotAngle,
        mdist = 0; /* max distance before hitting wall */
    if (ang === 0) {
      mdist = cols - x - 1;
    } else if (ang === 90) {
      mdist = y;
    } else if (ang === 180) {
      mdist = x;
    } else if (ang === 270) {
      mdist = rows - y - 1;
    }
    robot.drive(dist < mdist ? dist : mdist);
  };

  var _towards = function (robot, ang) {
    var rang = robot.robotAngle;
    if (rang >= ang) {
      robot.turnRight(rang - ang);
    } else {
      robot.turnLeft(ang - rang);
    }
  };

  exports.evalStatement = function (robot, block) {
    if (block.data.statement === 'drive') {
      _drive(robot, block.data.cnt);
    } else if (block.data.statement === 'drive-left') {
      _towards(robot, 180);
      _drive(robot, block.data.cnt);
    } else if (block.data.statement === 'drive-right') {
      _towards(robot, 0);
      _drive(robot, block.data.cnt);
    } else if (block.data.statement === 'drive-up') {
      _towards(robot, 90);
      _drive(robot, block.data.cnt);
    } else if (block.data.statement === 'drive-down') {
      _towards(robot, 270);
      _drive(robot, block.data.cnt);
    } else if (block.data.statement === 'turn-left') {
      robot.turnLeft(90);
    } else if (block.data.statement === 'turn-right') {
      robot.turnRight(90);
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
