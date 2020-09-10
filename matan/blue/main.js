var state = {
    on: false,
    points: [],
    dirty: true,
    color: 'blue'
}
function cmult(p1, p2) {
    return [p1[0]*p2[0] - p1[1]*p2[1], p1[0]*p2[1] + p1[1]*p2[0]]
}
function rotate(ang, p) {
    var rotator = [Math.cos(ang/180*Math.PI), Math.sin(ang/180*Math.PI)];
    return cmult(p, rotator);
}
function shift(offset, p) {
    return [p[0] + offset[0], p[1] + offset[1]]
}
function scale(u, p) {
    return [u*p[0], u*p[1]];
}
var count = 0;
function render() {
    var ctx = $('.canvas')[0].getContext('2d');
    ctx.clearRect(0, 0, state.W, state.H);
    $('.canvas')[0].getContext('2d').drawImage($('.offscreen_buffer')[0], 0, 0);
    draw_pallette();
    ctx.strokeStyle = state.color;
    ctx.fillStyle =state.color;
    ctx.lineWidth = 10;
    ctx.lineJoin = 'round';

    var half = state.unit / 2;
    for (var ang = 0; ang < 360; ang += 360/7) {
        for (var m = -1; m < 2; m +=2) {
            var transform = function(p) {
                var r = shift([state.W/2, state.H/2], rotate(ang, shift([-state.W/2, -state.H/2], p)));
                if (m == -1) {
                    return [r[0], state.H-r[1]];
                } else {
                    return r;
                }
            }

            var points = state.points;
            for (i = 0; i < state.points.length; ++i) {
                var p = transform([points[i][0], points[i][1]])
                if (i == 0) {
                    ctx.beginPath();
                    ctx.moveTo(p[0], p[1])
                } else {
                    ctx.lineTo(p[0], p[1]);
                }
            }
            ctx.stroke();

        }
    }

    // ctx.beginPath();
    // ctx.arc(half, half, 2, 0, 2 * Math.PI);
    // ctx.closePath();

    // ctx.fill();

    state.dirty = false;
}
function loop() {
    render();
    window.requestAnimationFrame(loop);
}

function turn_on(event) {
    state.on = true;
    render();
    state.points.push([event.offsetX, event.offsetY])
}
function turn_off() {
    state.on = false;
    state.points = [];
    $('.offscreen_buffer')[0].getContext('2d').drawImage($('.canvas')[0], 0, 0);


}
function ontouch(event) {
  event.stopPropagation();
  event.preventDefault();
  state.on = false;

  var touches = event.changedTouches;
  for (var i = 0; i < touches.length; i++) {
    state.points.push([touches[i].clientX - state.W/10, touches[i].clientY])
  }
  render();
}
function onmove(event) {
    if (state.on) {
        state.points.push([event.offsetX, event.offsetY])
        render();
    }

}
function resize() {
  state.W = window.innerWidth*0.9;
  state.H = window.innerHeight;
  canvas_elements = $('canvas');
  $('.canvas').attr('width', window.innerWidth*0.9);
  $('.canvas').attr('height', window.innerHeight);
  $('.offscreen_buffer').attr('width', window.innerWidth*0.9);
  $('.offscreen_buffer').attr('height', window.innerHeight);
  $('.canvas').css('left', window.innerWidth*0.1);
  $('.offscreen_buffer').css('left', window.innerWidth*0.1);
  $('.pallette').attr('height', window.innerHeight);
  $('.pallette').attr('width', window.innerWidth*0.1);
  state.unit = Math.min(state.W, state.H);
  render();
}
function draw_pallette() {
    var ctx = $('.pallette')[0].getContext('2d');
    var img = new Image();
    img.src = 'pallette.png'
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, 0, 0, state.W/10, state.H);
}
function rgbToHex(r, g, b) {
    if (r > 255 || g > 255 || b > 255)
        throw "Invalid color component";
    return ((r << 16) | (g << 8) | b).toString(16);
}
function choose_color(event) {
    var ctx = $('.pallette')[0].getContext('2d');
    var touches = event.changedTouches;
    var offsetX = event.offsetX;
    if (touches) {
        var x = touches[touches.length - 1].offsetX;
        var y = touches[touches.length - 1].offsetY;
    } else {
        var x = event.offsetX;
        var y = event.offsetY;
    }
    var p = ctx.getImageData(x, y, 1, 1).data;
    var hex = "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
    state.color = hex;

}
function ignite() {
    resize();
    $('.canvas').on('mousedown', turn_on)
    $('.canvas').on('mouseup', turn_off)
    $('.canvas').on('mouseleave', turn_off)
    $('.canvas').on('mouseout', turn_off)
    $('.canvas').on('mousemove', onmove)
    $('.canvas').on("touchstart", ontouch);
    $('.canvas').on("touchend", turn_off);
    $('.canvas').on("touchmove", ontouch);
    $('.pallette').on('mousedown', choose_color)
    $('.pallette').on("touchstart", choose_color);
    $('.pallette').on("touchmove", choose_color);
    window.addEventListener('resize', resize);
    render();

}
