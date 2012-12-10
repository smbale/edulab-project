/* Hacky! */
define(['svg'], 
function(svg) {
  var dialog = {
    state: [],
    cnt: 0
  };

  dialog.init = function (elem) {
    this.wrapper = elem;

    /* Create circles */
    var R = 40, PAD = 8;
    var svgelem = svg.create('svg', {
      'width': 450,
      'height': 480
    });
    this.svgelem = svgelem;

    var g = svg.create('g', {
      'transform': 'translate(0, 195)'
    });
    svgelem.appendChild(g);

    this.createIcon('drive-icon');
    svgelem.appendChild(this.icon);

    this.counter = svg.create('text', {
      'x': 400,
      'y': 110,
      'text-anchor': 'middle',
    });
    this.counter.textContent = '0';
    svgelem.appendChild(this.counter);

    this.okbtn = svg.create('g', {
      'transform': 'translate(370, 410)',
      'class': 'svg-button'
    });
    this.okbtn.appendChild(svg.create('rect', {
      'width': 65,
      'height': 60,
      'fill': 'rgba(255, 255, 255, 0)'
    }));
    this.okbtn.appendChild(svg.create('use', {
      'xlink:href': '#ok-icon',
    }));
    svgelem.appendChild(this.okbtn);
    this.createExitAction();

    $(elem).children('.dialog-wrapper').append(svgelem);

    for (var row = 0; row < 3; row++) {
      for (var col = 0; col < 3; col++) {
        var circle = svg.create('circle', {
          'r': R,
          'cx': col * (PAD + R*2) + R + 90,
          'cy': row * (PAD + R*2),
          'class': 'num-selector'
        });
        g.appendChild(circle);
        this.registerEvents(circle, row*5 + col);
        this.state.push(false);
      }
    }
  };

  dialog.registerEvents = function (circle, ind) {
    $(circle).click({dialog: this, ind: ind}, function(e) {
      var data = e.data;
      if (data.dialog.state[data.ind]) {
        svg.removeClass(this, 'selected');
        data.dialog.state[data.ind] = false;
        data.dialog.cnt--;
      } else {
        svg.addClass(this, 'selected');
        data.dialog.state[data.ind] = true;
        data.dialog.cnt++;
      }
      data.dialog.counter.textContent = '' + data.dialog.cnt;
    });
  };

  dialog.createIcon = function (icon) {
    var iconelem = svg.create('use', {
      'xlink:href': '#' + icon,
      'transform': 'scale(3, 3)'
    });

    if (this.icon) {
      this.icon.parentNode.removeChild(this.icon);
    }
    this.svgelem.appendChild(iconelem);
    this.icon = iconelem;
  };

  dialog.createExitAction = function () {
    $(this.okbtn).click(this, function (e) {
      var d = e.data;
      $(d.wrapper).hide();
    });
  };

  return dialog;
});
