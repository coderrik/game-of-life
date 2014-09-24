function GOFL(element) {
  var best_widths = {
    'xs' : 320,
    'sm' : 320,
    'md' : 480,
    'lg' : 480
  };

  var best_heights = {
    'xs' : 240,
    'sm' : 240,
    'md' : 360,
    'lg' : 360
  };

  var findBootstrapEnvironment = function() {
    var envs = ['xs', 'sm', 'md', 'lg'];

    $el = $('<div>');
    $el.appendTo($('body'));

    for(var i = envs.length - 1; i >= 0; i--) {
      var env = envs[i];

      $el.addClass('hidden-'+env);
      if($el.is(':hidden')) {
        $el.remove();
        return env
      }
    }
  };

  function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
      results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
  }

  var be = findBootstrapEnvironment();

  var description = $(element).html();
  $(element).html('');

  var widget = null;
  var canvas = null;
  var flash = null;
  var button_stop = null;
  var button_start = null;
  var button_reset = null;
  var button_randomise = null;
  var slider = null;
  var canvas_width = best_widths[be];
  var canvas_height = best_heights[be];
  var spinner = null;

  var context = null;

  var loaded_pattern = null;

  var wrap = true;

  var world = null;
  var world_width = 50;
  var world_height = 50;
  var world_scaling = 6;

  var active_world = 0;
  var inactive_world = 1;

  var speed = 3;
  var interval = null;

  if($(element).attr('data-width')) {
    canvas_width = $(element).attr('data-width');
  }
  if($(element).attr('data-height')) {
    canvas_height = $(element).attr('data-height');
  }

  var init_array = function(array_width, array_height) {
    var array = new Array(array_width);
    for(var col = 0; col < array_width; col++) {
      array[col] = new Array(array_height);
      for(var row = 0; row < array_height; row++) {
         array[col][row] = 0;
      }
    }
    return array;
  };

  var draw_world = function() {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    for(var x = 0; x < world_width; x++) {
      for(var y = 0; y < world_height; y++) {
        if(world[active_world][x][y] == 1) {
          context.beginPath();
          context.rect(x*world_scaling+0.5, y*world_scaling+0.5, world_scaling, world_scaling);
          context.fill();
          context.stroke();
        }
      }
    }
  };

  var start = function() {
    if(interval != null) {
      clearInterval(interval);
    }
    interval = setInterval(animate, 200*(6-speed));
    spinner.show();
  }

  var stop = function() {
    if(interval != null) {
      clearInterval(interval);
    }
    interval = null;
    spinner.hide();
  }

  var animate = function() {
    draw_world();
    advance();
  }

  var reset = function() {
    if(loaded_pattern != null) {
      apply_pattern(loaded_pattern);
    } else {
      world[active_world] = init_array(world_width, world_height);
      world[inactive_world] = init_array(world_width, world_height);
    }
    draw_world();
  };

  var randomise = function() {
    for(var x = 0; x < world_width; x++) {
      for(var y = 0; y < world_height; y++) {
        world[active_world][x][y]=Math.floor(Math.random()*3)%2;
      }
    }
    draw_world();
  };

  var canvas_click = function(e) {
    var world_x = Math.floor((e.pageX-widget.offset().left)/world_scaling);
    var world_y = Math.floor((e.pageY-widget.offset().top)/world_scaling);
    world[active_world][world_x][world_y] = 1-world[active_world][world_x][world_y];
    draw_world(); 
  };

  var advance = function() {
    for(var x = 0; x < world_width; x++) {
      for(var y = 0; y < world_height; y++) {
        var sum = 0;
        for(var col = -1; col <= 1; col++) {
          for(var row = -1; row <=1; row++) {
            var wrapped = false;
            var xcoord = x+col;
            var ycoord = y+row;

            if(ycoord < 0) {
              ycoord = world_height-1;
              wrapped = true;
            }

            if(ycoord >= world_height) {
              ycoord = 0;
              wrapped = true;
            }

            if(xcoord < 0) {
              xcoord = world_width-1;
              wrapped = true;
            }

            if(xcoord >= world_width) {
              xcoord = 0;
              wrapped = true;
            }

            if(!wrapped || wrap) {
              sum += world[active_world][xcoord][ycoord];
            }
          }
        }

        if(sum == 3) {
          world[inactive_world][x][y] = 1;
        } else if(sum == 4) {
          world[inactive_world][x][y] = world[active_world][x][y];
        } else {
          world[inactive_world][x][y] = 0;
        }
      }
    }

    active_world = 1-active_world;
    inactive_world = 1-inactive_world;
  };

  var apply_pattern = function(pattern) {
    var pattern_width_scaling = canvas_width/(pattern.width+6);
    var pattern_height_scaling = canvas_height/(pattern.height+6);
    var pattern_scaling = (pattern_width_scaling < pattern_height_scaling) ? pattern_width_scaling : pattern_height_scaling;

    world_scaling = Math.floor(pattern_scaling);
    world_width = Math.floor(canvas_width/world_scaling);
    world_height = Math.floor(canvas_height/world_scaling);

    world = init_array(world_width);
    world[active_world] = init_array(world_width, world_height);
    world[inactive_world] = init_array(world_width, world_height);

    var shift_x = Math.floor((world_width-pattern.width)/2);
    var shift_y = Math.floor((world_height-pattern.height)/2);

    for(var x = 0; x < pattern.width; x++) {
      for(var y = 0; y < pattern.height; y++) {
        world[active_world][x+shift_x][y+shift_y]=pattern.cells[x][y];
      }
    }

    draw_world();
  };

  var load_pattern105 = function(data, filename, content_length) {
    var pattern = { cells: [] };

    var name = "";
    var descr = "";
    var author = "";

    // determine width & height
    var minx = Number.MAX_VALUE;
    var maxx = Number.MIN_VALUE;
    var miny = Number.MAX_VALUE;
    var maxy = Number.MIN_VALUE;

    var offsetX = 0;
    var offsetY = 0;

    var row = 0;
    for(var i = 0; i < data.length; i++) {
      if(data[i] != "") {
        if(data[i].indexOf('#P') == 0) {
          var offsets = data[i].substring(3).split(" ");
          offsetX = parseInt(offsets[0]);
          offsetY = parseInt(offsets[1]);
          if(offsetX < minx) { minx = offsetX; }
          if(offsetY < miny) { miny = offsetY; }
          row = 0;
        } else if(data[i].indexOf('#D Author:') == 0) {
          author = data[i].substring(11);
        } else if(data[i].indexOf('#D Name:') == 0) {
          name = data[i].substring(8);
        } else if(data[i].indexOf('#D') == 0) {
          descr += data[i].substring(3);
        } else if(data[i].charAt(0) != "#") {
          var xcoord = offsetX + data[i].length;
          var ycoord = offsetY + row;

          if(xcoord > maxx) { maxx = xcoord; }
          if(ycoord > maxy) { maxy = ycoord; }
          row++;
        }
      }
    }
    descr = descr.replace(/\r/,'');
    descr = descr.replace(/([http:\/\/]*www\.[A-Z|a-z|-|0-9]+\.[A-Z|a-z|0-9|_|\-|\/|\?|\.|\=]+)/,' <a target="_blank" href="http://\$1">\$1</a>');

    pattern.width = (Math.abs(minx)+Math.abs(maxx)+1);
    pattern.height = (Math.abs(miny)+Math.abs(maxy)+1);

    if(pattern.width > canvas_width || pattern.height > canvas_height) {
      flash.html('Pattern \"' + filename + '\" is too large or an invalid format.');
      flash.show();
      loaded_pattern = null;
    } else {
      pattern.cells = init_array(pattern.width, pattern.height);

      // populate and shift origin to 0,0
      var y = 0;
      for(var i = 0; i < data.length; i++) {
        if(data[i] != "") {
          if(data[i].indexOf('#P') == 0) {
            var offsets = data[i].substring(3).split(" ");
            offsetX = parseInt(offsets[0]);
            offsetY = parseInt(offsets[1]);
            y = 0;
          } else if(data[i].charAt(0) != "#") {
            for(var x = 0; x < data[i].length; x++) {
              if(data[i].charAt(x) == '*') {
                pattern.cells[offsetX+x+Math.abs(minx)][offsetY+y+Math.abs(miny)]=1;
              }
            }
            y++;
          }
        }
      }

      loaded_pattern = pattern;

      stats_filename.html(filename);
      stats_filesize.html(content_length + ' bytes');
      stats_dimensions.html(pattern.width + 'x' + pattern.height);
      stats_author.html(author);
      stats_name.html(name);
      stats_description.html(descr);
      apply_pattern(pattern);
    }
  };

  var load_pattern106 = function(data, filename, content_length) {
    var pattern = { cells: [] };

    // determine width & height
    var minx = Number.MAX_VALUE;
    var maxx = Number.MIN_VALUE;
    var miny = Number.MAX_VALUE;
    var maxy = Number.MIN_VALUE;
    for(var i = 0; i < data.length; i++) {
      if(data[i][0] != "#" && data[i] != "") {
        var coords = data[i].split(" ");
        var xcoord = parseInt(coords[0]);
        var ycoord = parseInt(coords[1]);

        if(xcoord > maxx) { maxx = xcoord; }
        if(xcoord < minx) { minx = xcoord; }
        if(ycoord > maxy) { maxy = ycoord; }
        if(ycoord < miny) { miny = ycoord; }
      }
    }

    pattern.width = (Math.abs(minx)+Math.abs(maxx)+1);
    pattern.height = (Math.abs(miny)+Math.abs(maxy)+1);

    if(pattern.width > canvas_width || pattern.height > canvas_height) {
      flash.html('Pattern \"' + filename + '\" is too large or an invalid format.');
      flash.show();
      loaded_pattern = null;
    } else {
      pattern.cells = init_array(pattern.width, pattern.height);

      // populate and shift origin to 0,0
      for(var i = 0; i < data.length; i++) {
        if(data[i][0] != "#" && data[i] != "") {
          var coords = data[i].split(" ");
          var xcoord = parseInt(coords[0])+Math.abs(minx);
          var ycoord = parseInt(coords[1])+Math.abs(miny);

          if(data[i][0] != "#" && data[i] != "") {
            pattern.cells[xcoord][ycoord]=1;
          }
        }
      }

      loaded_pattern = pattern;

      stats_filename.html(filename);
      stats_filesize.html(content_length + ' bytes');
      stats_dimensions.html(pattern.width + 'x' + pattern.height);
      stats_author.html('');
      stats_name.html('');
      stats_description.html('');

      apply_pattern(pattern);
    }
  };

  var load_pattern = function(url) {
    $.ajax({
      url: url,

      type: "GET",

      success: function(response, status, request) {
        var data = response.split("\n");
        if(data[0].indexOf('#Life 1.05') == 0) {
          load_pattern105(data, url, request.getResponseHeader('Content-Length'));
        } else {
          load_pattern106(data, url, request.getResponseHeader('Content-Length'));
        }
      },

      error: function(xhr, status, e) {
        console.log(xhr);
        flash.html('Failed to load \"' + url + '\": ' + e + '.');
        flash.show();
      }
    });
  };

  var slide = function(arg) {
    speed = arg.value;
    if(interval != null) {
      stop();
      start();
    }
  };

  // speed
  slider = $('<input data-slider-tooltip="hide" type="text" data-slider-min="1" data-slider-max="5" data-slider-step="1" data-slider-value="3"/>');
  if($(element).attr('data-wrap') != undefined) {
    if($(element).attr('data-wrap') == "false") {
      wrap = false;
    } else {
      wrap = true;
    }
  }
  div_row = $('<div class="row" style="padding-bottom:5px"></div>');
  div_row.append(
    $('<div class="col-md-6"></div>').append(
      $('<span>').append(
        'Speed&nbsp;&nbsp;'
      ).append(
        slider
      )
    )
  ).css('display', $(element).attr('data-speed-show') == "false" ? 'none' : '');
  $(element).append(div_row);
  slider.slider().on('slideStop', slide);

  // buttons
  button_start = $('<button type="button" class="btn btn-primary">Start</button>');
  button_start.click(start);
  if($(element).attr('data-start-show') == 'false') {
    button_start.hide();
  }

  button_reset = $('<button type="button" class="btn btn-primary">Reset</button>');
  button_reset.click(reset);
  if($(element).attr('data-reset-show') == 'false') {
    button_reset.hide();
  }

  button_randomise = $('<button type="button" class="btn btn-primary">Randomize</button>');
  button_randomise.click(randomise);
  if($(element).attr('data-randomise-show') == 'false') {
    button_randomise.hide();
  }

  button_stop = $('<button type="button" class="btn btn-danger">Stop</button>');
  button_stop.click(stop);
  if($(element).attr('data-stop-show') == 'false') {
    button_stop.hide();
  }

  var div_row = $('<div class="row" style="padding-bottom: 5px"></div>');
  div_row.append(
    $('<div class="col-md-12"></div>').append(
      button_start
    ).append(
      '\n'
    ).append(
      button_reset
    ).append(
      '\n'
    ).append(
      button_randomise
    ).append(
      '\n'
    ).append(
      button_stop
    )
  );
  $(element).append(div_row);

  // flash
  flash = $('<div class="alert alert-danger" style="width: ' + canvas_width + 'px"></div>');
  div_row = $('<div class="row"></div>');
  div_row.append(
    $('<div class="col-md-12"></div>').append(flash)
  );
  flash.hide();
  $(element).append(div_row);

  // canvas || stats
  widget = $('<canvas style="background-color: grey" width="' + canvas_width + '" height="' + canvas_height + '"></canvas>');
  if($(element).attr('data-editable') != 'false') {
    widget.click(canvas_click);
  }
  canvas = widget[0];
  spinner =  $('<img style="vertical-align: top" src="images/loading.gif"/>');
  spinner.hide();
  div_row = $('<div class="row"></div>');
  div_row.append(
    $('<div class="col-md-6"></div>').append(canvas)
      .append(' ')
      .append(spinner)
  );


  var stats_filename = $('<span/>');
  var stats_filesize = $('<span/>');
  var stats_dimensions = $('<span/>');
  var stats_author = $('<span/>');
  var stats_name = $('<span/>');
  var stats_description = $('<span/>');
  if($(element).attr('data-stats-show') != 'false') {
    div_row.append(
      $('<div class="col-md-6"/>').append(
        $('<table class="table"/>').append(
          $('<tr/>').append(
            $('<td/>').append('Filename:')
          ).append(
            $('<td/>').append(stats_filename)
          )
        ).append(
          $('<tr/>').append(
            $('<td/>').append('File Size:')
          ).append(
            $('<td/>').append(stats_filesize)
          )
        ).append(
          $('<tr/>').append(
            $('<td/>').append('Dimensions:')
          ).append(
            $('<td/>').append(stats_dimensions)
          )
        ).append(
          $('<tr/>').append(
            $('<td/>').append('Name:')
          ).append(
            $('<td/>').append(stats_name)
          )
        ).append(
          $('<tr/>').append(
            $('<td/>').append('Author:')
          ).append(
            $('<td/>').append(stats_author)
          )
        ).append(
          $('<tr/>').append(
            $('<td colspan="2"/>').append(stats_description)
          )
        ).append(
          $('<tr/>').append(
            $('<td colspan="2"/>').append(description)
          )
        )
      )
    );
  } else {
    div_row.append(
      $('<div class="col-md-6"/>').append(
        $('<table class="table"/>').append(
          $('<tr/>').append(
            $('<td/>').append(description)
          )
        )
      )
    );
  }
  
  $(element).append(div_row);

  // end table

  context = canvas.getContext('2d');
  context.shadowBlur = 0;
  context.fillStyle='red';

  if($(element).attr('data-url')) {
    load_pattern($(element).attr('data-url'))
  } else if($(element).attr('data-param')) {
    load_pattern(getParameterByName($(element).attr('data-param')));
  } else {
    world_scaling = 12;
    world_width = Math.floor(canvas_width/world_scaling);
    world_height = Math.floor(canvas_height/world_scaling);

    world = []
    world[active_world] = init_array(world_width, world_height);
    world[inactive_world] = init_array(world_width, world_height);
  }
};

var gofl_ready = function() {
  var gofls = $('.gofl');
  for(var i = 0; i < gofls.length; i++) {
    new GOFL(gofls[i]);
  }
};

$(document).ready(gofl_ready);
