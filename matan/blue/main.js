var state = {
    on: false,
    points: [],
    dirty: false
}
function turn_on(event) {
    state.on = true;
    state.points.push([event.offsetX, event.offsetY])
}

function render() {
    if (!state.dirty) {
        return;
    }
    console.log(state)
    var ctx = state.context;
    ctx.clearRect(0, 0, state.W, state.H);
    ctx.strokeStyle = 'blue';
    ctx.fillStyle ='blue';
    ctx.lineWidth = 10;
    ctx.lineJoin = 'round';
    var half = state.unit / 2;
    for (var ang = 0; ang < 360; ang += 30) {
        var transform = function(p) {
            return shift([half, half], rotate(ang, shift([-half, -half], p)))
        }
        var points = state.points;
        for (i = 0; i < state.points.length; ++i) {
            var p = transform([points[i][0], points[i][1]])
            if (i == 0) {
                ctx.beginPath()
                ctx.moveTo(p[0], p[1])
            } else {
                ctx.lineTo(p[0], p[1]);
            }
        }
        ctx.closePath()
        ctx.fill("nonzero");
        ctx.stroke();
    }
    ctx.fillStyle ='violet';
    ctx.beginPath();
    ctx.arc(half, half, 2, 0, 2 * Math.PI);
    ctx.fill();
    state.dirty = false;
}

function loop() {
    render();
    window.requestAnimationFrame(loop);

}
function turn_off() {
    state.on = false;
    state.points = [];
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
function ontouch(event) {
  var touches = event.changedTouches;

  for (var i = 0; i < touches.length; i++) {
        state.points.push([touches[i].pageX, touches[i].pageY])
    }
}
function onmove(event) {
    if event.touches {

    }
    if (state.on) {
        state.points.push([event.offsetX, event.offsetY])
        state.dirty = true;
    }
}
function resize() {
    console.log('RZ');
  canvas_element = $('.canvas')[0];
  state.W = window.innerWidth;
  state.H = window.innerHeight;
  canvas_element.width = state.W;
  canvas_element.height = state.H;
  state.context = canvas_element.getContext('2d');
  state.unit = Math.min(state.W, state.H);
  canvas_element.width = window.innerWidth;
  canvas_element.height = window.innerHeight;
  state.dirty = true;
}
function ignite() {
    canvas_element = $('.canvas')[0]
    state.W = window.innerWidth;
    state.H = window.innerHeight;
    resize();
    canvas_element.addEventListener('mousedown', turn_on)
    canvas_element.addEventListener('mouseup', turn_off)
    canvas_element.addEventListener('mouseleave', turn_off)
    canvas_element.addEventListener('mouseout', turn_off)
    canvas_element.addEventListener('mousemove', onmove)
    canvas_element.addEventListener("touchstart", turn_on, false);
    canvas_element.addEventListener("touchend", turn_off, false);
    canvas_element.addEventListener("touchmove", onmove, false);
      window.addEventListener('resize', resize)
    loop();
}
