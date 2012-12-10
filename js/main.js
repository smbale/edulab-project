require([
    'svg',
    'blockeditor',
    'blockdialog',
    'block',
    'startblock',
    'controlblock',
    'eval'],
function (svg, BlockEditor, dialog, Block, StartBlock, ControlBlock, evalBlocks) {
  robotApplet = new window.jsdares.robot.ProgramApplet($('.robot-applet'), {
    readOnly: true,
    blockSize: 64,
    state: '{"columns":8,"rows":8,"initialX":0,"initialY":7,"initialAngle":90,"mazeObjects":50,"verticalActive":[[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false]],"horizontalActive":[[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false]],"blockGoal":[[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,true,false,false],[false,false,false,false,false,false,false,false],[false,false,false,true,false,false,false,false],[false,false,false,false,false,false,false,false],[false,true,false,false,false,false,false,false],[false,false,false,false,false,false,false,false]],"numGoals":1}'
  });

  var editor = new BlockEditor();

  startBlock = editor.createBlock(StartBlock, {
    onrun: function () {
      robotApplet.setProgram(function (r) {r.turnLeft(0);});
      robotApplet.setProgram(evalBlocks.createEval(startBlock));
    },
    data: {eval: evalBlocks.evalStatement}
  });
  editor.createBlockGroup(40, 20, [startBlock]);

  var createNumberSelector = function (data) {
    var elem = svg.create('g');
    elem.appendChild(svg.create('use', {
      'x': 6,
      'y': 7,
      'xlink:href': '#' + data.icon
    }));

    var circles = svg.create('g', {
      'transform': 'translate(66, 16)',
      'class': 'svg-button'
    });

    /* Create circles */
    var R = 4, PAD = 2, cnt = data.cnt;
    circles.appendChild(svg.create('rect', {
      'width': 3 * (2 * R) + 2 * PAD,
      'height': 3 * (2 * R) + 2 * PAD,
      'fill': 'rgba(255, 255, 255, 0)'
    }));
    data.selected = [];
    for (var row = 0; row < 3; row++) {
      for (var col = 0; col < 3; col++) {
        var circle = svg.create('circle', {
          'r': R,
          'cx': col * (PAD + R*2) + R,
          'cy': row * (PAD + R*2) + R,
          'style': 'fill:white',
          'class': 'num-selector'
        });
        if (row === 0 && col === 0) {
          data.firstCircle = circle;
        }

        if (cnt > 0) {
          svg.addClass(circle, 'selected');
          cnt--;
          data.selected.push(true);
        } else {
          data.selected.push(false);
        }

        circles.appendChild(circle);
      }
    }

    elem.appendChild(circles);

    $(circles).click(function () {
      dialog.show(data);
    });

    return elem;
  };

  var createStatementOpts = function (stmt) {
    if (stmt === 'turn-left' || stmt === 'turn-right') {
      return {
        icon: stmt + '-icon',
        data: {statement: stmt, eval: evalBlocks.evalStatement}
      };
    } else {
      var data = {
        statement: stmt, 
        icon: stmt + '-icon', 
        cnt: 1, 
        eval: evalBlocks.evalStatement,
        cls: 'statement-block'
      };
      var elem = createNumberSelector(data, stmt + '-icon');
      return {elem: elem, data: data};
    }
  };

  var createLoopOpts = function () {
    var data = {
      icon: 'loop-icon', 
      cnt: 1, 
      eval: evalBlocks.evalLoop,
      cls: 'control-block'
    };
    var elem = createNumberSelector(data, 'loop-icon');
    return {cnt:1, elem: elem, data: data};
  };

  var blocks = [
    [180, 60, 'drive'],
    [20, 120, 'turn-right'],
    [200, 160, 'loop'],
    [320, 120, 'drive-up'],
    [30, 220, 'loop'],
  ];
  
  var i = blocks.length;
  while (i--) {
    if (blocks[i][2] === 'loop') {
      var b = editor.createBlock(ControlBlock, createLoopOpts());
      editor.createBlockGroup(blocks[i][0], blocks[i][1], [b]);
    } else {
      var b = editor.createBlock(Block,
                                 createStatementOpts(blocks[i][2]));
      editor.createBlockGroup(blocks[i][0], blocks[i][1], [b]);
    }
  }

  $('.blocks-editor').prepend(editor.svg);

  dialog.init($('.dialog')[0]);
});
