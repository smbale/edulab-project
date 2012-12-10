require([
    'blockeditor',
    'blockdialog',
    'block',
    'startblock',
    'controlblock',
    'eval'],
function (BlockEditor, dialog, Block, StartBlock, ControlBlock, evalBlocks) {
  robotApplet = new window.jsdares.robot.ProgramApplet($('.robot-applet'), {
    readOnly: true,
    blockSize: 64,
    state: '{"columns":8,"rows":8,"initialX":2,"initialY":4,"initialAngle":0,"mazeObjects":50,"verticalActive":[[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false]],"horizontalActive":[[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false]],"blockGoal":[[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,true,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false]],"numGoals":1}'
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

  var dataStatement = {statement: 'drive', eval: evalBlocks.evalStatement};
  var dataLoop = {eval: evalBlocks.evalLoop, cnt: 4};

  b1 = editor.createBlock(Block, {
    icon: 'turn-left-icon',
    data: {statement: 'turn-left', eval: evalBlocks.evalStatement}
  });
  editor.createBlockGroup(180, 60, [b1]);

  b2 = editor.createBlock(Block, {icon: 'drive-down-icon', data: dataStatement});
  editor.createBlockGroup(200, 160, [b2]);

  b3 = editor.createBlock(ControlBlock, {
    icon: 'loop-icon',
    cnt: 1,
    data: dataLoop
  });
  editor.createBlockGroup(70, 200, [b3]);

  b4 = editor.createBlock(ControlBlock, {
    icon: 'loop-icon',
    cnt: 1,
    data: dataLoop
  });
  startBlock.append(b4);

  $('.blocks-editor').prepend(editor.svg);

  dialog.init($('.dialog')[0]);
});
