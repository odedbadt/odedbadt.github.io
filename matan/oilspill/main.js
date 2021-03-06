var R1 = 40;
var R2 = 80;
var on = false;

function log(s) {
    $('#log').text($('#log').text() + '\n' + s);
    if ($('#log').text().length > 100) {
        $('#log').text($('#log').text().slice($('#log').text().length - 100));
    }
}
function progress_pixel(data, offset) {
    data[offset] = 0;
    data[offset + 1] = 0;
    data[offset + 2] = 0;
}
function progress_pixel(data, offset) {
    for (var j = 0; j < 3; ++j) {
        var j_1 = (j + 1) % 3;
        if (data[offset + j] == 255
            && data[offset + j_1] < 255) {
                data[offset + j_1] = data[offset + j_1] + 1;
        } else if (data[offset + j] <= 255
            && data[offset + j_1] == 255) {
                data[offset + j] = data[offset + j] - 1;
        }
    }
}
function progress_fire() {
    var canvas_element = $('.canvas')[0]
    var context = canvas_element.getContext('2d');
    var W = window.innerWidth;
    var H = window.innerHeight;
    data = context.getImageData(0, 0, W, H);
    for (var y = H - 1; y >=0; --y) {
        for (var x = 0; x < W-1; ++x) {
            var base_offset = (y * W + x) *4;
            for (var t=0;t<3;++t) {
                data[base_offset+t] = (
                    data[base_offset+t+W*4] +
                    data[base_offset+t+W*4-1] +
                    data[base_offset+t+W*4+1]) / 3;
            }
        }
    }
    context.putImageData(data, 0, 0);

}
function add_circle(cx, cy) {
    var canvas_element = $('.canvas')[0]
    var context = canvas_element.getContext('2d')
    var delta = 0;
    if (Math.random() > 0.2) {
        delta = 1;
    }
    dr = delta;
    dg = delta;
    db = delta;
    var pixel_data = context.getImageData(cx - R1, cy - R1, R1*2, R1*2);
    for (var y = -R1; y <= R1; ++y) {
        for (var x = -R1; x <= R1; ++x) {
            if (x * x + y * y > R1 * R1) {
                continue;
            }
            var base_offset = ((y + R1) * R1 * 2 + x + R1) * 4;
            progress_pixel(pixel_data.data, base_offset)
            pixel_data.data[base_offset + 3] = 255;
        }
    }
    context.putImageData(pixel_data, cx - R1, cy - R1);
}
function add_random_circle(offsetX, offsetY) {
    log([offsetX, offsetY]);
    var r = Math.random();
    var alpha = Math.random() * 2 * Math.PI;
    r = Math.sqrt(r);
    var cx = offsetX + Math.cos(alpha) * r * R2;
    var cy = offsetY + Math.sin(alpha) * r * R2;
    add_circle(cx, cy);
}
function onmove(event) {
    position = [event.offsetX, event.offsetY]
    add_circle_if_on()
}
function add_circle_if_on() {
    if (on) {
        add_random_circle(position[0], position[1])
    }
    progress_fire();
    window.setTimeout(add_circle_if_on, R1);
}
function turn_on(event) {
    on = true;
    position = [event.offsetX, event.offsetY]
    add_circle(event.offsetX, event.offsetY)
}
function ontouch(event) {
  event.stopPropagation();
  event.preventDefault();
  on = true;
  var touches = event.changedTouches;
  for (var i = 0; i < touches.length; i++) {
    position = [touches[i].clientX, touches[i].clientY]
    add_circle(touches[i].clientX, touches[i].clientY);
  }
}
function turn_off() {
    on = false;
}
function resize() {
  $('.canvas').attr('width', window.innerWidth);
  $('.canvas').attr('height', window.innerHeight);
  var canvas_element = $('.canvas')[0]
  var ctx = canvas_element.getContext('2d');
  ctx.fillStyle = '#F00';
  ctx.fillRect(0, 0, window.innerWidth,window.innerHeight);

}
function ignite() {
    var canvas_element = $('.canvas')[0]
    var ctx = canvas_element.getContext('2d');
    console.log(canvas_element)
    canvas_element.addEventListener('mousedown', turn_on)
    canvas_element.addEventListener('mouseup', turn_off)
    canvas_element.addEventListener('mouseleave', turn_off)
    canvas_element.addEventListener('mouseoiut', turn_off)
    canvas_element.addEventListener('mousemove', onmove)
    $('.canvas').on("touchstart", ontouch);
    $('.canvas').on("touchmove", ontouch);
    $('.canvas').on("touchend", turn_off);
    window.addEventListener('resize', resize);
    add_circle_if_on();

    resize();
}
