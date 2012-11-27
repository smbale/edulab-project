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

    /* List of global block groups */
    this.globalGroups = [];

    /* Just for testing: create a few blocks. */
    var createChain = function (blist) {
      for (var i = 1; i < blist.length; i++) {
        blist[i-1].append(blist[i]);
      }
    };

    b1 = this.createBlock('J');
    b2 = this.createBlock('O');
    b3 = this.createBlock('E');
    createChain([b1, b2, b3]);
    bg1 = this.createBlockGroup(50, 50),
    bg1.appendChain(b1);

    b4 = this.createBlock('C');
    b5 = this.createBlock('A');
    b6 = this.createBlock('M');
    b7 = this.createBlock('E');
    b8 = this.createBlock('L');
    b9 = this.createBlock();
    createChain([b4, b5, b6, b7, b8, b9]);
    bg2 = this.createBlockGroup(200, 50),
    bg2.appendChain(b4);


    /* Enable dragging of `Block`s. */

    this.dragState = {
      block: null,
      attachee: null,
      firstMovement: false,
      x: 0,
      y: 0
    };

    /* `t` is timer id of a postponed calculation used on `mousemove` */
    var t = null;  

    $(this.surface.svg).mousemove(function (e) {
      var block = that.dragState.block;

      /* If there is a block being dragged */
      if (block !== null) {

        /* If there is no pending timer, schedule one that whill check
         * if the dragged block is attachable. */
        if (t === null) {
          t = setTimeout(function () {
            var dragState = that.dragState;
            /* If still dragging */
            if (dragState.block !== null) {
              /* Check if `dragState.block` is attachable */
              var attachee = that.attachable(dragState.block);

              /* If attachee is changed or there is no attachee,
               * stop hover effect on the previous attachee */
              if (dragState.attachee && dragState.attachee !== attachee) {
                dragState.attachee.onHoverEnd();
              }

              /* If there is an attachee, start hover effect on it. */
              if (attachee) attachee.onHoverStart();

              dragState.attachee = attachee;
            }
            t = null;
          }, 20);
        };

        /* Detach the chain from the current group. */
        if (!block.isFirst()) {
          /* Create a new block group which will keep the blocks */
          var x = block.group._x,
              y = block.group._y + block.prev._y + block.height(),
              bg = that.createBlockGroup(x, y);
          bg.appendChain(block);
        }
        
        if (that.dragState.firstMovement) {

          block.onDragStart();
          that.dragState.firstMovement = false;
        }

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
        that.dragState.block.onDragEnd();

        /* If the dragged block is dropped */
        if (that.dragState.attachee) {
          var temp = that.dragState.block.group;
          that.dragState.attachee.onHoverEnd();
          that.dragState.attachee.appendChain(that.dragState.block);
          that.removeBlockGroup(temp);
        }

        that.dragState.block = null;
        that.dragState.attachee = null;
        that.dragState.firstMovement = false;

        /* Remove "dragging" class from SVG TODO */
        that.svg.style.cursor = 'default';
      }
    });
  };

  /* Makes `block` draggable */
  BlockEditor.prototype.enableDragging = function (block) {
    var that = this;

    $(block.wrapper).mousedown(function (e) {
      /* If left mouse key is pressed */
      if (e.which === 1) {
        that.dragState.x = e.clientX;
        that.dragState.y = e.clientY;
        that.dragState.block = block;

        /* Add "dragging" class to SVG TODO */
        that.svg.style.cursor = '-webkit-grabbing';

        /* Helps discover the first movement after mouse down. */
        that.dragState.firstMovement = true;

        /* If block.group is global, move it to the foreground */
        var canvas = that.surface.canvas;
        if (canvas.hasChildNodes(block.group.wrapper)) {
          canvas.appendChild(block.group.wrapper);
        }

        return false;
      }
    });
  };

  /* Creates new `Block`. */
  BlockEditor.prototype.createBlock = function (text) {
    var b = new Block({text: text});
    this.enableDragging(b);
    return b;
  };

   /* Creates a new global `BlockGroup` on position x, y.
    * The group is added to global groups.
    */
   BlockEditor.prototype.createBlockGroup = function (x, y) {
    var bg = new BlockGroup();
    this.surface.canvas.appendChild(bg.wrapper);
    bg.translateBy(x, y);
    this.globalGroups.push(bg);
    return bg;
  };

  /* Removes `blockGroup` from global block groups. */
  BlockEditor.prototype.removeBlockGroup = function (blockGroup) {
    this.globalGroups.splice(this.globalGroups.indexOf(blockGroup), 1);
    blockGroup.wrapper.parentNode.removeChild(blockGroup.wrapper);
  };

  /* Checks if `block` is attachable to some block.
   * Returns the block to which is attachable or null. */
  BlockEditor.prototype.attachable = function (block) {
    for (var i = 0, length = this.globalGroups.length; i < length; i++) {
      var bg = this.globalGroups[i];
      if (bg === block.group) continue;
      var b = bg.attachable(block);
      if (b) return b;
    };
  };

  return BlockEditor;
});
