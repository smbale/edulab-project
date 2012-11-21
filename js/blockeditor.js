define(['surface', 'mouseTool', 'block', 'blockgroup'],
function (Surface, MouseTool, Block, BlockGroup) {

  /* **BlockEditor** represents the block editor.
   * It uses `Surface`, which is zoomable and pannable, to place `Block`s.
   * The user of `BlockEditor` has to place it into DOM using `this.svg`
   * element.
   *
   * All `Block`s are placed into `BlockGroup`s.
   */
  var BlockEditor = function () {
    var that = this;

    /* Create new `Surface` and add `MouseTool` to it. */
    this.surface = new Surface();
    new MouseTool(this.surface);

    this.svg = this.surface.svg;

    /* Just for testing: create two blocks. */
    var b = new Block({data: 'red'}),
        bg = new BlockGroup();
    this.enableDragging(b);
    bg.append(b);
    bg.translateBy(10, 10);
    this.surface.canvas.appendChild(bg.wrapper);

    b = new Block({fill: 'blue', data: 'blue'});
    this.enableDragging(b);
    bg = new BlockGroup();
    bg.append(b);
    bg.translateBy(10, 50);
    this.surface.canvas.appendChild(bg.wrapper);

    /* Enable dragging of `Block`s. */

    this.dragState = {
      block: null,
      x: 0,
      y: 0,
    };

    /* `t` is timer id of a postponed calculation used on `mousemove` */
    var t = null;  

    $(this.surface.svg).mousemove(function (e) {
      var block = that.dragState.block;

      /* if there is a block being dragged */
      if (block !== null) {

        if (t === null) {
          t = setTimeout(function () {
            /* do some calculation */
            if (that.dragState.block !== null) {
              //console.log("BlockGroup: mousemove", that.dragState.block);
            }
            t = null;
          }, 500);
        };

        var x2 = e.clientX,
            y2 = e.clientY,
            s  = that.surface._scale;

        /* translate the group to which `block` belongs */
        block.group.translateBy((x2 - that.dragState.x) / s,
                                (y2 - that.dragState.y) / s);
        that.dragState.x = x2;
        that.dragState.y = y2;
        return false;
      };
    });

    /* Stop dragging */
    $(document).mouseup(function () {
      if (that.dragState.block !== null) {
        that.dragState.block.dragging = false;
        that.dragState.block = null;
      }
    });
  };

  /* Makes `block` draggable */
  BlockEditor.prototype.enableDragging = function (block) {
    var that = this;

    $(block.wrapper).mousedown(function (e) {
      /* If left mouse key is pressed */
      if (e.which === 1) {
        //console.log("BlockGroup: mousedown", block);
        block.dragging = true;
        that.dragState.x = e.clientX;
        that.dragState.y = e.clientY;
        that.dragState.block = block;

        /* If block.group is global, move it to the foreground */
        var canvas = that.surface.canvas;
        if (canvas.hasChildNodes(block.group.wrapper)) {
          canvas.appendChild(block.group.wrapper);
        }

        return false;
      }
    });
  };

  return BlockEditor;
});
