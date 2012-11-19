require(['surface', 'mouseTool', 'svg'],
function (Surface, MouseTool, svg) {
  var robotApplet = new window.jsdares.robot.ProgramApplet($('.robot-applet'), {readOnly: false, blockSize: 64, state: '{"columns":8,"rows":8,"initialX":3,"initialY":4,"initialAngle":90,"mazeObjects":50,"verticalActive":[[false,false,false,false,false,false,false,false],[false,false,true,true,true,false,true,false],[false,true,false,false,true,false,false,true],[false,false,true,true,false,false,true,false],[false,true,true,false,false,false,false,false],[false,false,false,true,false,true,true,false],[false,false,true,false,true,true,false,false],[false,false,false,true,true,true,true,false]],"horizontalActive":[[false,true,false,false,true,false,false,true],[false,true,false,true,false,false,true,false],[false,true,true,false,true,false,true,false],[false,true,false,false,true,true,true,false],[false,false,true,true,false,true,false,true],[false,true,false,false,true,false,false,true],[false,true,true,true,false,false,false,true],[false,true,true,false,false,false,false,false]],"blockGoal":[[false,false,false,true,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false],[false,false,false,false,false,false,false,false]],"numGoals":1}'});

  var surface = new Surface();
  new MouseTool(surface);
  $('.blocks-editor').append(surface.svg);
  surface.canvas.appendChild(svg.svgElement('circle', {
    cx: 20,
    cy: 30,
    r: 10,
    fill: 'red'}));
});
