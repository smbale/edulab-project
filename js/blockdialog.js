/* Hacky! */
define(['svg'], 
function(svg) {
  var dialog = {
    selected: [],
    cnt: 0
  };

  dialog.init = function (elem) {
    this.wrapper = elem;

    var svgelem = svg.create('svg', {
      'width': 450,
      'height': 480
    });
    this.svgelem = svgelem;

    this.circles = svg.create('g', {
      'transform': 'translate(0, 195)'
    });
    svgelem.appendChild(this.circles);

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

    /* Create circles */
    var R = 40, PAD = 8;
    for (var row = 0; row < 3; row++) {
      for (var col = 0; col < 3; col++) {
        var circle = svg.create('circle', {
          'r': R,
          'cx': col * (PAD + R*2) + R + 90,
          'cy': row * (PAD + R*2),
          'class': 'num-selector'
        });
        this.circles.appendChild(circle);
        this.registerEvents(circle, row*3 + col);
        this.selected.push(false);
      }
    }
  };

  dialog.updateCircles = function (firstCircle, s1, s2) {
    for (var c = firstCircle, i = 0; c; c = c.nextSibling, i++) {
      if (s1.selected[i]) {
        svg.addClass(c, 'selected');
      } else {
        svg.removeClass(c, 'selected');
      }
      s2.selected[i] = s1.selected[i];
    }
    s2.cnt = s1.cnt;
  };

  dialog.registerEvents = function (circle, ind) {
    $(circle).click({dialog: this, ind: ind}, function(e) {
      var data = e.data;
      if (data.dialog.selected[data.ind]) {
        svg.removeClass(this, 'selected');
        data.dialog.selected[data.ind] = false;
        data.dialog.cnt--;
      } else {
        svg.addClass(this, 'selected');
        data.dialog.selected[data.ind] = true;
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
      d.updateCircles(d.data.firstCircle, d, d.data);
      $(d.wrapper).fadeOut(200);
    });
  };

  dialog.show = function (data) {
      this.createIcon(data.icon);
      this.counter.textContent = '' + data.cnt;
      this.updateCircles(this.circles.firstChild, data, this);
      this.data = data;
      $(this.wrapper).addClass(data.cls).fadeIn(200);
  };

  return dialog;
});
