function Life(element) {

  // default bootstrap environment
  var DEFAULT_CANVAS_ENVIRONMENT = 'md';

  // canvas widths for different devices
  var DEFAULT_CANVAS_WIDTHS = { 'xs' : 320, 'sm' : 320, 'md' : 480, 'lg' : 480 };

  // canvas heights for different devices
  var DEFAULT_CANVAS_HEIGHTS = { 'xs' : 240, 'sm' : 240, 'md' : 360, 'lg' : 360 };

  // timer interval
  var interval = null;

  // UI components
  var ui = {
    flash : null,
    button_stop : null,
    button_start : null,
    button_reset : null,
    button_clear : null,
    button_randomize : null,
    button_zoomin : null,
    button_zoomout : null,
    slider : null,
    spinner : null,

    stats_filename : null,
    stats_filesize : null,
    stats_diemnsions : null,
    stats_author : null,
    stats_name : null,
    stats_description : null,

    speed : 3,

    canvas : {
      widget  : null,
      element : null,
      context : null,
      width   : DEFAULT_CANVAS_WIDTHS[DEFAULT_CANVAS_ENVIRONMENT],
      height  : DEFAULT_CANVAS_HEIGHTS[DEFAULT_CANVAS_ENVIRONMENT],

      dragging : false,
      dragged : false,
      lastX : -1,
      lastY : -1,
      _ondrag : null,

      _onclick : null,

      init : function(w, h) {
        if(w == null || h == null) {
          var environments = ['xs', 'sm', 'md', 'lg'];
          var environment = null;

          var element = $('<div>');
          element.appendTo($('body'));

          for(var i = environments.length - 1; i >= 0 && environment == null; i--) {
            element.addClass('hidden-'+environments[i]);
            if(element.is(':hidden')) {
              element.remove();
              environment = environments[i];
            }
          }

          if(environment == null) {
            environment = DEFAULT_CANVAS_ENVIRONMENT;
          }

          this.width = DEFAULT_CANVAS_WIDTHS[environment];
          this.height = DEFAULT_CANVAS_HEIGHTS[environment];
        } else {
          this.width = w;
          this.height = h;
        }

       this.element = $('<canvas tabindex="1" style="background-color: grey" width="' + this.width + '" height="' + this.height + '"></canvas>');
       this.element.mousedown($.proxy(this.mouse,this));
       this.element.mousemove($.proxy(this.mouse, this));
       $(window).mouseup($.proxy(this.mouse,this));
       this.element.click($.proxy(this.click, this));

       this.widget = ui.canvas.element[0];

       this.context = this.widget.getContext('2d');
       this.context.shadowBlur = 0;
       this.context.fillStyle='red';
      },

      square : function(x, y, size) {
        this.context.beginPath();
        this.context.rect(x, y, size, size);
        this.context.fill();
        this.context.stroke();
        this.context.closePath();
      },

      onclick : function(f) {
        this._onclick = f;
      },

      onkeypress : function(f) {
        this.element.keypress(f);
      },

      ondrag : function(f) {
        this._ondrag = f;
      },

      clear : function() {
        this.context.clearRect(0, 0, this.width, this.height);
      },

      click : function(e) {
        if(!this.dragged && this._onclick) {
          this._onclick(e);
        }
      },

      mouse : function(e) {
        if(e.originalEvent.type == "mousedown") {
          this.dragging = true;
          this.dragged = false;
          this.lastX = e.screenX;
          this.lastY = e.screenY;
        } else if(e.originalEvent.type == "mouseup") {
          this.dragging = false;
          this.lastX = -1;
          this.lastY = -1;
        } else if(this.dragging) {
          if(this._ondrag) {
            this.dragged = true;
            this._ondrag(e.screenX-this.lastX, e.screenY-this.lastY);
          }
          this.lastX = e.screenX;
          this.lastY = e.screenY;
        }
      }

    },

    init : function(options) {
      this.canvas.init(options.width, options.height);

      this.flash = $('<div class="alert alert-danger" style="width: ' + this.canvas.width + 'px"></div>');
      this.flash.hide();

      this.button_start = $('<button type="button" class="btn btn-success">Start</button>');
      if(!options.start) { this.button_start.hide(); }

      this.button_reset = $('<button type="button" class="btn btn-primary">Reset</button>');
      if(!options.reset) { this.button_reset.hide(); }

      this.button_randomize = $('<button type="button" class="btn btn-primary">Randomize</button>');
      if(!options.randomize) { this.button_randomize.hide(); }

      this.button_clear = $('<button type="button" class="btn btn-warning">Clear</button>');
      if(!options.clear) { this.button_clear.hide(); }

      this.button_stop = $('<button type="button" class="btn btn-danger">Stop</button>');
      if(!options.stop) { this.button_stop.hide(); }

      this.button_zoomin = $('<button type="button" class="btn btn-default"><span class="glyphicon glyphicon-plus"></span></button>');
      this.button_zoomout = $('<button type="button" class="btn btn-default"><span class="glyphicon glyphicon-minus"></span></button>');

      this.stats_filename = $('<span/>');
      this.stats_filesize = $('<span/>');
      this.stats_dimensions = $('<span/>');
      this.stats_author = $('<span/>');
      this.stats_name = $('<span/>');
      this.stats_description = $('<span/>');

      if(options.speed) {
        var s = parseInt(options.speed);
        if(s >= 1  || s <= 5) {
          this.speed = s;
        }
      }
      this.slider = $('<input data-slider-tooltip="hide" type="text" data-slider-min="1" data-slider-max="5" data-slider-step="1" data-slider-value="' + this.speed + '"/>');

      this.spinner =  $('<img style="vertical-align: top" src="images/loading.gif"/>');
      this.spinner.hide();
    },

    onstart : function(f) { this.button_start.click(f); },

    onstop : function(f) { this.button_stop.click(f); },

    onclear : function(f) { this.button_clear.click(f); },

    onrandomize : function(f) { this.button_randomize.click(f); },

    onreset : function(f) { this.button_reset.click(f); },

    onzoomin : function(f) { this.button_zoomin.click(f); },

    onzoomout : function(f) { this.button_zoomout.click(f); },

    stats : function(filename, filesize, dimensions, author, name, description) {
      this.stats_filename.html(filename);
      this.stats_filesize.html(filesize);
      this.stats_dimensions.html(dimensions);
      this.stats_author.html(author);
      this.stats_name.html(name);
      this.stats_description.html(description);
    },

    error : function(message) {
      this.flash.html(message);
      this.flash.show();
    }
  };

  // world
  var DEFAULT_WORLD_WIDTH = 50;
  var DEFAULT_WORLD_HEIGHT = 50;
  var world = {
    cells  : [],
    width  : DEFAULT_WORLD_WIDTH,
    height : DEFAULT_WORLD_HEIGHT,
    active : 0,

    init   : function(w, h) {
      for(var a = 0; a < 2; a++) {
        this.cells[a] = new Array(w);
        for(var x = 0; x < w; x++) {
          this.cells[a][x] = new Array(h);
          for(var y = 0; y < h; y++) {
             this.cells[a][x][y] = 0;
          }
        }
      }
      this.width = w;
      this.height = h;
    },

    get : function(x, y) {
      if(x >= 0 && x < this.width && y >= 0 && y < this.height) {
        return this.cells[this.active][x][y];
      } else {
        return 0;
      }
    },

    put : function(x, y, value) {
      if(x >= 0 && x < this.width && y >= 0 && y < this.height) {
        this.cells[this.active][x][y] = value;
      }
    },

    toggle : function(x, y) {
      this.put(x, y, 1-this.get(x,y));
    },

    clear : function() {
      for(var x = 0; x < this.width; x++) {
        for(var y = 0; y < this.height; y++) {
          this.cells[this.active][x][y] = 0;
        }
      }
    },

    randomize : function() {
      for(var x = 0; x < this.width; x++) {
        for(var y = 0; y < this.height; y++) {
          this.cells[this.active][x][y]=Math.floor(Math.random()*3)%2;
        }
      }
    },

    // game of life algorithm
    advance : function() {
      for(var x = 0; x < this.width; x++) {
        for(var y = 0; y < this.height; y++) {
          var sum = 0;
          for(var col = -1; col <= 1; col++) {
            for(var row = -1; row <=1; row++) {
              var xcoord = x+col;
              var ycoord = y+row;

              if(xcoord >= 0 && xcoord < this.width && ycoord >= 0 && ycoord < this.height) {
                sum += this.cells[this.active][xcoord][ycoord];
              }
            }
          }

          if(sum == 3) {
            this.cells[1-this.active][x][y] = 1;
          } else if(sum == 4) {
            this.cells[1-this.active][x][y] = this.cells[this.active][x][y];
          } else {
            this.cells[1-this.active][x][y] = 0;
          }
        }
      }

      this.active = 1-this.active;
    },

    load : function(p) {
      for(var x = 0; x < this.width; x++) {
        for(y = 0; y < this.height; y++) {
          this.put(x, y, p.get(x, y));
        }
      }
    },
  };

  var pattern = {

    cells : [],
    width : 1,
    height : 1,
    pwidth : 1,
    pheight : 1,

    clipped : 0,

    filename : '',
    filesize : '',
    dimensions : '',
    author : '',
    name : '',
    description : '',

    init : function(w, h) {
      this.width = w;
      this.height = h;
      this.cells = new Array(this.width);
      for(var x = 0; x < this.width; x++) {
        this.cells[x] = new Array(this.height);
        for(var y = 0; y < this.height; y++) {
           this.cells[x][y] = 0;
        }
      }
    },

    get : function(x, y) {
      return this.cells[x][y];
    },

    // load pattern from url
    load : function(url, okcb, notokcb) {
      $.ajax({
        url: url,

        type: "GET",

        context: this,

        success: function(response, status, request) {
          var data = response.split("\n");
          var origin = {
            x : Math.round(this.width/2),
            y : Math.round(this.height/2)
          };
          var P = {
            x : 0,
            y : 0
          };
          var y = 0;

          var x1 = origin.x;
          var y1 = origin.y;
          var x2 = origin.x;
          var y2 = origin.y;

          this.clipped = 0;

          this.description = '';
          if(data[0].indexOf('#Life 1.05') == 0) {
            for(var i = 0; i < data.length; i++) {
              if(data[i] != "") {
                 if(data[i].indexOf('#P') == 0) {
                   var offsets = data[i].substring(3).split(" ");
                   P.x = parseInt(offsets[0]);
                   P.y = parseInt(offsets[1]);
                   y = 0;
                 } else if(data[i].indexOf('#D Author:') == 0) {
                   this.author = data[i].substring(11);
                 } else if(data[i].indexOf('#D Name:') == 0) {
                   this.name = data[i].substring(8);
                 } else if(data[i].indexOf('#D') == 0) {
                   this.description += data[i].substring(3);
                 } else if(data[i].charAt(0) != "#") {
                   for(var x = 0; x < data[i].length; x++) {
                     var cellx = origin.x+P.x+x;
                     var celly = origin.y+P.y+y;

                     if(cellx >= 0 && cellx < this.width && celly >= 0 && celly < this.height) {
                       if(cellx < x1) { x1 = cellx };
                       if(cellx > x2) { x2 = cellx };
                       if(celly < y1) { y1 = celly };
                       if(celly > y2) { y2 = celly };

                       if(data[i].charAt(x) == '*') {
                         this.cells[cellx][celly] = 1;
                       }
                     } else {
                       this.clipped++;
                     }
                   }
                   y++;
                 }
              }
            }
            this.pwidth = x2-x1+1;
            this.pheight = y2-y1+1;

            this.dimensions = this.pwidth + 'x' + this.pheight;
            this.filename = url.split('/').reverse()[0];
            if(request.getResponseHeader('Content-Length')) {
              this.filesize = request.getResponseHeader('Content-Length') + ' bytes';
            } else {
              this.filesize = '';
            }
            this.description = this.description.replace(/\r/,'').replace(/[http:\/\/]*(www\.[A-Z|a-z|-|0-9]+\.[A-Z|a-z|0-9|\(|\)_|\-|\/|\?|\.|\=]+)/,' <a target="_blank" href="http://\$1">\$1</a>');

            okcb(this);
          } else {
            notokcb('File is not Life 1.05 format');
          }
        },

        error: function(xhr, status, e) {
          notokcb('Failed to load \"' + url + '\": ' + e + '.');
        }
      });
    }
  };

  // camera 
  var camera = {
    x: 200,
    y: 160,
    translate : {
      x: 48,
      y: 0
    },
    width: 1,
    height: 1,
    scale: 30,

    init : function(w, h) {
      this.width = w;
      this.height = h;
    },

    pan : function(px, py) {
      this.y -= parseInt((this.translate.y-py)/this.scale);
      this.translate.y = ((this.translate.y-py)%this.scale);
      this.x -= parseInt((this.translate.x-px)/this.scale);
      this.translate.x = ((this.translate.x-px)%this.scale);
    },

    zoom : function(px, py, zoom) {
      if((this.scale+zoom) > 0 && (this.scale+zoom) < parseInt(Math.max(world.height,world.width)/2)) {
        var panx = Math.round((px-this.translate.x)/this.scale)*zoom;
        var pany = Math.round((py-this.translate.y)/this.scale)*zoom;

        this.scale += zoom;
        this.width = Math.floor(world.width/this.scale);
        this.height = Math.floor(world.height/this.scale);

        this.pan(panx, pany);
      }
    }

  };

  // fetches value for a url parameter
  // https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript/901144#901144
  function parameter(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
      results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
  }

  // clear canvas and draw active cells
  var redraw = function() {
    ui.canvas.clear();
    for(var x = -1; x <= camera.width; x++) {
      for(var y = -1; y <= camera.height; y++) {
        if(world.get(camera.x+x,camera.y+y) == 1) {
          ui.canvas.square((x*camera.scale)+camera.translate.x+0.5, (y*camera.scale)+camera.translate.y+0.5, camera.scale);
        }
      }
    }
  };

  // start animation
  var start = function() {
    if(interval != null) {
      clearInterval(interval);
    }
    interval = setInterval(animate, 200*(6-ui.speed));
    ui.spinner.show();
  };

  // stop animation
  var stop = function() {
    if(interval != null) {
      clearInterval(interval);
    }
    interval = null;
    redraw();
    ui.spinner.hide();
  };

  // keypress on canvas
  var keypress = function(e) {
    // left
    if(e.keyCode == 37) {
      camera.pan(-4,0);
      e.preventDefault();
      redraw();
    // right
    } else if(e.keyCode == 39) {
      camera.pan(4,0);
      e.preventDefault();
      redraw();
    // up
    } else if(e.keyCode == 38) {
      camera.pan(0,-4);
      e.preventDefault();
      redraw();
    // down
    } else if(e.keyCode == 40) {
      camera.pan(0,4);
      e.preventDefault();
      redraw();
    }
  };

  // drag
  var drag = function(x, y) {
    camera.pan(x, y);
    redraw();
  }

  // zoom in
  var zoomin = function() {
    camera.zoom(Math.round(ui.canvas.width/2),Math.floor(ui.canvas.height/2),2);
    redraw();
  };

  // zoom out
  var zoomout = function() {
    camera.zoom(Math.round(ui.canvas.width/2),Math.floor(ui.canvas.height/2),-2);
    redraw();
  };

  // clear all cells
  var clear = function() {
    world.clear();
    ui.stats('','','','','','');
    redraw();
  };

  // animate - draw cells, advance, repeat
  var animate = function() {
    world.advance();
    redraw();
  };

  // redraw loaded pattern or clear cells
  var reset = function() {
    world.load(pattern);
    focus();
    ui.stats(pattern.filename, pattern.filesize, pattern.dimensions, pattern.author, pattern.name, pattern.description);
    redraw();
  };

  // draw some random (kind of) cells
  var randomize = function() {
    world.randomize();
    redraw();
  };

  // slider slided - change speed and restart animation
  var slide = function(arg) {
    ui.speed = arg.value;
    if(interval != null) {
      stop();
      start();
    }
  };

  // canvas clicked
  var click = function(e) {
    world.toggle(
      camera.x+Math.floor((e.pageX-ui.canvas.element.offset().left-camera.translate.x)/camera.scale),
      camera.y+Math.floor((e.pageY-ui.canvas.element.offset().top-camera.translate.y)/camera.scale)
    );
    redraw(); 
  };

  // zoom camera into the pattern
  var focus = function() {
    // totally no idea how this is working !
    camera.scale = Math.floor(Math.min(ui.canvas.height/pattern.pheight,ui.canvas.width/pattern.pwidth));
    camera.width = Math.floor(ui.canvas.width/camera.scale);
    camera.height = Math.floor(ui.canvas.height/camera.scale);
    // centre of pattern (unfortunately some patterns are not central!)
    camera.x = parseInt(world.width/2)-parseInt(camera.width/2);
    camera.y = parseInt(world.height/2)-parseInt(camera.height/2);
    camera.translate.x = Math.floor(((world.width)%camera.scale)/2);
    camera.translate.y = Math.floor(((world.height)%camera.scale)/2);
  };

  // load pattern from url
  var load_pattern = function(url) {
    pattern.init(world.width, world.height);
    pattern.load(url,
      function(p) {
        world.load(p);
        focus();
        ui.stats(pattern.filename, pattern.filesize, pattern.dimensions, pattern.author, pattern.name, pattern.description);
        if(p.clipped > 0) {
          ui.flash.html('Warning: ' + p.clipped + ' point' + (p.clipped == 1 ? '' : 's') + ' clipped');
          ui.flash.show();
        }
        redraw();
      },
      function(m) {
        ui.error(m);
      }
    );
  };

  // clear and store the users text
  var text = $(element).html();
  $(element).html('');

  // build ui
  ui.init(
    {
      start:     $(element).attr('data-start-show')     != 'false',
      stop:      $(element).attr('data-stop-show')      != 'false',
      randomize: $(element).attr('data-randomize-show') != 'false',
      reset:     $(element).attr('data-reset-show')     != 'false',
      clear:     $(element).attr('data-clear-show')     != 'false',
      speed:     $(element).attr('data-speed'),
      width:     $(element).attr('data-width'),
      height:    $(element).attr('data-height')
    }
  );

  div_row = $('<div class="row" style="padding-bottom:5px"></div>');
  div_row.append(
    $('<div class="col-md-6"></div>').append(
      $('<span>').append(
        'Speed&nbsp;&nbsp;'
      ).append(
        ui.slider
      )
    )
  ).css('display', $(element).attr('data-speed-show') == "false" ? 'none' : '');
  $(element).append(div_row);
  ui.slider.slider().on('slideStop', slide); // needs to appended

  // button components
  ui.onstart(start);
  ui.onstop(stop);
  ui.onrandomize(randomize);
  ui.onreset(reset);
  ui.onclear(clear);

  var div_row = $('<div class="row" style="padding-bottom: 5px"></div>');
  div_row.append(
    $('<div class="col-md-12"></div>').append(
      ui.button_start
    ).append(
      '\n'
    ).append(
      ui.button_reset
    ).append(
      '\n'
    ).append(
      ui.button_randomize
    ).append(
      '\n'
    ).append(
      ui.button_clear
    ).append(
      '\n'
    ).append(
      ui.button_stop
    )
  );
  $(element).append(div_row);

  // flash component
  div_row = $('<div class="row"></div>');
  div_row.append(
    $('<div class="col-md-12"></div>').append(
      ui.flash
    )
  );
  $(element).append(div_row);

  // canvas component
  if($(element).attr('data-editable') != 'false') {
    ui.canvas.onclick(click);
  }
  ui.canvas.onkeypress(keypress);
  if($(element).attr('data-draggable') != 'false') {
    ui.canvas.ondrag(drag);
  }

  ui.onzoomin(zoomin);
  ui.onzoomout(zoomout);

  div_row = $('<div class="row"></div>');
  div_row.append(
    $('<div class="col-md-6"></div>'
    ).append(
      ui.canvas.widget
    ).append(
      ' '
    ).append(
      $('<div style="vertical-align: top" class="btn-group-vertical btn-group-sm">').append(
        ui.button_zoomin
      ).append(
        ui.button_zoomout
      )
    ).append( 
      ' '
    ).append(
      ui.spinner
    )
  );

  // stats components
  if($(element).attr('data-stats-show') != 'false') {
    div_row.append(
      $('<div class="col-md-6"/>').append(
        $('<table class="table"/>').append(
          $('<tr/>').append(
            $('<td/>').append('Filename:')
          ).append(
            $('<td/>').append(ui.stats_filename)
          )
        ).append(
          $('<tr/>').append(
            $('<td/>').append('File Size:')
          ).append(
            $('<td/>').append(ui.stats_filesize)
          )
        ).append(
          $('<tr/>').append(
            $('<td/>').append('Dimensions:')
          ).append(
            $('<td/>').append(ui.stats_dimensions)
          )
        ).append(
          $('<tr/>').append(
            $('<td/>').append('Name:')
          ).append(
            $('<td/>').append(ui.stats_name)
          )
        ).append(
          $('<tr/>').append(
            $('<td/>').append('Author:')
          ).append(
            $('<td/>').append(ui.stats_author)
          )
        ).append(
          $('<tr/>').append(
            $('<td colspan="2"/>').append(ui.stats_description)
          )
        ).append(
          $('<tr/>').append(
            $('<td colspan="2"/>').append(text)
          )
        )
      )
    );
  } else {
    div_row.append(
      $('<div class="col-md-6"/>').append(
        $('<table class="table"/>').append(
          $('<tr/>').append(
            $('<td/>').append(text)
          )
        )
      )
    );
  }
  
  $(element).append(div_row);

  // initialise world
  world.init(ui.canvas.width, ui.canvas.height);

  // load pattern or default world
  if($(element).attr('data-url')) {
    load_pattern($(element).attr('data-url'))
  } else if($(element).attr('data-param')) {
    load_pattern(parameter($(element).attr('data-param')));
  } else {
    camera.scale = 20;
    camera.width = Math.floor(ui.canvas.width/camera.scale);
    camera.height = Math.floor(ui.canvas.height/camera.scale);

    camera.x = Math.ceil(world.width/2)-Math.floor(camera.width/2);
    camera.y = Math.ceil(world.height/2)-Math.floor(camera.height/2);

    camera.translate.x = Math.floor(((world.width)%camera.scale)/2);
    camera.translate.y = Math.floor(((world.height)%camera.scale)/2);
  }
};

$(document).ready(function() {
  var games = $('.life');
  for(var i = 0; i < games.length; i++) {
    new Life(games[i]);
  }
});

