// <div id="pattern"
//      class="gofl"
//      data-randomise-show="false"
//      data-url="/patterns/washerwoman_105.lif"
//      data-wrap="false"
//      data-editable="false"></div>
function GOFL(element) {
  // main components
  var viewport = null;
  var canvas = null;
  var flash = null;
  var button_stop = null;
  var button_start = null;
  var button_reset = null;
  var button_clear = null;
  var button_randomise = null;
  var slider = null;
  var spinner = null;

  // components to hold pattern meta-data
  var stats_filename = null;
  var stats_filesize = null;
  var stats_dimensions = null;
  var stats_author = null;
  var stats_name = null;
  var stats_description = null;

  // drawing context for cavas
  var context = null;

  // default sizes
  var canvas_width = 480;
  var canvas_height = 320;

  // html between <div class="gofl"></div> if any
  var description = '';

  // pattern array
  var loaded_pattern = null;

  // wrap the canvas
  var wrap = true;

  // 3-d array to hold cells
  var world = null;
  var world_width = 50;
  var world_height = 50;
  var world_scaling = 6;

  // padding around pattern - some need space to grow
  var padding_left = 3;
  var padding_right = 3;
  var padding_top = 3;
  var padding_bottom = 3;

  // pointers to two world arrays - old world, new world
  var active_world = 0;
  var inactive_world = 1;

  // controls animation delay
  var speed = 3;

  // timer interval
  var interval = null;

  // default bootstrap environment
  var be = 'md';

  // canvas widths for different devices
  var best_widths = {
    'xs' : 320,
    'sm' : 320,
    'md' : 480,
    'lg' : 480
  };

  // canvas heights for different devices
  var best_heights = {
    'xs' : 240,
    'sm' : 240,
    'md' : 360,
    'lg' : 360
  };

  // finds bootstrap environment type
  // https://stackoverflow.com/questions/14441456/how-to-detect-which-device-view-youre-on-using-twitter-bootstrap-api
  var bootstrap_environment = function() {
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

  // fetches value for a url parameter
  // https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript/901144#901144
  function parameter_value(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
      results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
  }

  // create and initialize an array with zeroes
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

  // clear canvas and draw active cells
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

  // start animation
  var start = function() {
    if(interval != null) {
      clearInterval(interval);
    }
    interval = setInterval(animate, 200*(6-speed));
    spinner.show();
  };

  // stop animation
  var stop = function() {
    if(interval != null) {
      clearInterval(interval);
    }
    interval = null;
    spinner.hide();
  };

  // clear all cells
  var clear = function() {
    world[active_world] = init_array(world_width, world_height);
    world[inactive_world] = init_array(world_width, world_height);
    stats_filename.html('');
    stats_filesize.html('');
    stats_dimensions.html('');
    stats_author.html('');
    stats_name.html('');
    stats_description.html('');
    draw_world();
  };

  // animate - draw cells, advance, repeat
  var animate = function() {
    draw_world();
    advance();
  };

  // redraw loaded pattern or clear cells
  var reset = function() {
    if(loaded_pattern != null) {
      apply_pattern(loaded_pattern);
    } else {
      world[active_world] = init_array(world_width, world_height);
      world[inactive_world] = init_array(world_width, world_height);
    }
    draw_world();
  };

  // draw some random (kind of) cells
  var randomise = function() {
    for(var x = 0; x < world_width; x++) {
      for(var y = 0; y < world_height; y++) {
        world[active_world][x][y]=Math.floor(Math.random()*3)%2;
      }
    }
    draw_world();
  };

  // draw a cell on the canvas
  var canvas_click = function(e) {
    var world_x = Math.floor((e.pageX-viewport.offset().left)/world_scaling);
    var world_y = Math.floor((e.pageY-viewport.offset().top)/world_scaling);
    world[active_world][world_x][world_y] = 1-world[active_world][world_x][world_y];
    draw_world(); 
  };

  // game of life algorithm
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

  // map pattern to world, scaling to fit viewport
  var apply_pattern = function(pattern) {
    var pattern_width_scaling = canvas_width/(pattern.width+padding_left+padding_right);
    var pattern_height_scaling = canvas_height/(pattern.height+padding_top+padding_bottom);
    var pattern_scaling = (pattern_width_scaling < pattern_height_scaling) ? pattern_width_scaling : pattern_height_scaling;

    world_scaling = Math.floor(pattern_scaling);
    world_width = Math.floor(canvas_width/world_scaling);
    world_height = Math.floor(canvas_height/world_scaling);

    world = init_array(world_width);
    world[active_world] = init_array(world_width, world_height);
    world[inactive_world] = init_array(world_width, world_height);

    var shift_x = Math.floor((world_width-(pattern.width+padding_left+padding_right))/2)+padding_left;
    var shift_y = Math.floor((world_height-(pattern.height+padding_top+padding_bottom))/2)+padding_top;

    for(var x = 0; x < pattern.width; x++) {
      for(var y = 0; y < pattern.height; y++) {
        world[active_world][x+shift_x][y+shift_y]=pattern.cells[x][y];
      }
    }

    stats_filename.html(pattern.filename);
    stats_filesize.html(pattern.filesize);
    stats_dimensions.html(pattern.dimensions);
    stats_author.html(pattern.author);
    stats_name.html(pattern.name);
    stats_description.html(pattern.description);

    draw_world();
  };

  // load patterns in Life 1.06 format
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

    if((pattern.width+padding_right+padding_left) > canvas_width || (pattern.height+padding_top+padding_bottom) > canvas_height) {
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

      pattern.filename = filename.split('/').reverse()[0];
      pattern.filesize = content_length + ' bytes';
      pattern.dimensions = pattern.width + 'x' + pattern.height;
      pattern.author = '';
      pattern.name = '';
      pattern.description = '';

      loaded_pattern = pattern;

      apply_pattern(pattern);
    }
  };

  // load patterns in Life 1.05 format
  var load_pattern105 = function(data, filename, content_length) {
    var pattern = { cells: [] };

    var name = "";
    var descr = "";
    var author = "";

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

    // turn any 'www....' into links
    descr = descr.replace(/\r/,'');
    descr = descr.replace(/[http:\/\/]*(www\.[A-Z|a-z|-|0-9]+\.[A-Z|a-z|0-9|\(|\)_|\-|\/|\?|\.|\=]+)/,' <a target="_blank" href="http://\$1">\$1</a>');

    pattern.width = (Math.abs(minx)+Math.abs(maxx)+1);
    pattern.height = (Math.abs(miny)+Math.abs(maxy)+1);

    if((pattern.width+padding_right+padding_left) > canvas_width || (pattern.height+padding_top+padding_bottom) > canvas_height) {
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

      pattern.filename = filename.split('/').reverse()[0];
      if(content_length) {
        pattern.filesize = content_length + ' bytes';
      } else {
        pattern.filesize = '';
      }
      pattern.dimensions = pattern.width + 'x' + pattern.height;
      pattern.author = author;
      pattern.name = name;
      pattern.description = descr;

      loaded_pattern = pattern;

      apply_pattern(pattern);
    }
  };

  // load patterns in Life 1.06 format
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

      pattern.filename = filename.split('/').reverse()[0];
      if(content_length) {
        pattern.filesize = content_length + ' bytes';
      } else {
        pattern.filesize = '';
      }
      pattern.dimensions = pattern.width + 'x' + pattern.height;
      pattern.author = '';
      pattern.name = '';
      pattern.description = '';

      loaded_pattern = pattern;

      apply_pattern(pattern);
    }
  };

  // load pattern from url
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

  // slider slided - change speed and restart animation
  var slide = function(arg) {
    speed = arg.value;
    if(interval != null) {
      stop();
      start();
    }
  };


  // clear and store the description
  description = $(element).html();
  $(element).html('');

  // determine canvas dimensions
  be = bootstrap_environment();
  if($(element).attr('data-width')) {
    canvas_width = $(element).attr('data-width');
  } else {
    canvas_width = best_widths[be];
  }
  if($(element).attr('data-height')) {
    canvas_height = $(element).attr('data-height');
  } else {
    canvas_height = best_heights[be];
  }

  // slider component
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

  // button components
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

  button_clear = $('<button type="button" class="btn btn-warning">Clear</button>');
  button_clear.click(clear);
  if($(element).attr('data-clear-show') == 'false') {
    button_clear.hide();
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
      button_clear
    ).append(
      '\n'
    ).append(
      button_stop
    )
  );
  $(element).append(div_row);

  // flash component
  flash = $('<div class="alert alert-danger" style="width: ' + canvas_width + 'px"></div>');
  div_row = $('<div class="row"></div>');
  div_row.append(
    $('<div class="col-md-12"></div>').append(flash)
  );
  flash.hide();
  $(element).append(div_row);

  // canvas component
  viewport = $('<canvas style="background-color: grey" width="' + canvas_width + '" height="' + canvas_height + '"></canvas>');
  if($(element).attr('data-editable') != 'false') {
    viewport.click(canvas_click);
  }
  canvas = viewport[0];
  //spinner =  $('<img style="vertical-align: top" src="' + $('script[src$="gofl.js"]').attr('src').replace(/gofl.js/,'../images/loading.gif') + '"/>');
  spinner =  $('<img style="vertical-align: top" src="images/loading.gif"/>');
  spinner.hide();
  div_row = $('<div class="row"></div>');
  div_row.append(
    $('<div class="col-md-6"></div>').append(canvas)
      .append(' ')
      .append(spinner)
  );
  context = canvas.getContext('2d');
  context.shadowBlur = 0;
  context.fillStyle='red';

  // stats components
  stats_filename = $('<span/>');
  stats_filesize = $('<span/>');
  stats_dimensions = $('<span/>');
  stats_author = $('<span/>');
  stats_name = $('<span/>');
  stats_description = $('<span/>');
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

  // set padding
  if($(element).attr('data-padding-left')) {
    padding_left = parseInt($(element).attr('data-padding-left'));
  }
  if($(element).attr('data-padding-right')) {
    padding_right = parseInt($(element).attr('data-padding-right'));
  }
  if($(element).attr('data-padding-top')) {
    padding_top = parseInt($(element).attr('data-padding-top'));
  }
  if($(element).attr('data-padding-bottom')) {
    padding_bottom = parseInt($(element).attr('data-padding-bottom'));
  }

  // load pattern or default world
  if($(element).attr('data-url')) {
    load_pattern($(element).attr('data-url'))
  } else if($(element).attr('data-param')) {
    load_pattern(parameter_value($(element).attr('data-param')));
  } else {
    world_scaling = 12;
    world_width = Math.floor(canvas_width/world_scaling);
    world_height = Math.floor(canvas_height/world_scaling);

    world = []
    world[active_world] = init_array(world_width, world_height);
    world[inactive_world] = init_array(world_width, world_height);
  }
};

$(document).ready(function() {
  var gofls = $('.gofl');
  for(var i = 0; i < gofls.length; i++) {
    new GOFL(gofls[i]);
  }
});

