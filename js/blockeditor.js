define([
    'svg',
    'surface',
    'mouseTool',
    'blockgroup'],
function (svg,
          Surface,
          MouseTool,
          BlockGroup) {

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
          }, 40);
        };

        /* Detach the chain from the current group. */
        if (!block.isFirst() || block.group.hasParent()) {
          /* Create a new block group which will keep the blocks */
          var pos = block.globalPosition(),
              oldgroup = block.group,
              bg = that.createBlockGroup(pos.x, pos.y);
          bg.appendChain(block);
          oldgroup.update();
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

        svg.removeClass(that.svg, 'dragging');
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

        svg.addClass(that.svg, 'dragging');

        /* Helps discover the first movement after mouse down. */
        that.dragState.firstMovement = true;

        /* If block.group is global, move it to the foreground */
        if (that.isGroupGlobal(block.group)) {
          that.surface.canvas.appendChild(block.group.wrapper);
        }

        return false;
      }
    });
  };

  BlockEditor.prototype.isGroupGlobal = function (blockGroup) {
    var i = this.globalGroups.length;
    while (i--) {
      if (this.globalGroups[i] === blockGroup) return true;
    }
    return false;
  };

  /* Creates new block. */
  BlockEditor.prototype.createBlock = function (Constructor, opts) {
    var b = new Constructor(opts);
    this.enableDragging(b);
    return b;
  };

  /* Creates a new global `BlockGroup` on position x, y.
   * If array `blocks` is provided, it creates a chain of blocks
   * and appends it into the group.
   * The group is added to global groups.
   */
  BlockEditor.prototype.createBlockGroup = function (x, y, blocks) {
    var bg = new BlockGroup();
    this.surface.canvas.appendChild(bg.wrapper);
    bg.translateBy(x, y);
    this.globalGroups.push(bg);
    if (blocks) {
      this.createChain(blocks);
      bg.appendChain(blocks[0]);
    }
    return bg;
  };

  /* Chains blocks in `blist`. */
  BlockEditor.prototype.createChain = function (blist) {
      for (var i = 1; i < blist.length; i++) {
        blist[i-1].append(blist[i]);
      }
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
