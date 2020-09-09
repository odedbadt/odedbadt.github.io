var state = {
    on: false,
    points: []
}
function turn_on(event) {
    state.on = true;
    state.points.push([event.offsetX, event.offsetY])
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
function onmove(event) {
    if (state.on) {
        state.points.push([event.offsetX, event.offsetY])
        for (var ang = 0; ang < 360; ang += 30) {
            var transform = function(p) {
                    return shift([500, 500], rotate(ang, shift([-500, -500], p)))
                }
            var ctx = state.context;
            var points = state.points;
            ctx.strokeStyle = 'blue';
            ctx.fillStyle='blue';
            ctx.lineWidth = 10;
            ctx.lineJoin = 'round'
            ctx.beginPath()
            var p = transform([points[0][0], points[0][1]])
            ctx.moveTo(p[0], p[1]);
            for (i = 0; i < state.points.length; ++i) {
                p = transform([points[i][0], points[i][1]])
                ctx.lineTo(p[0], p[1]);
                //ctx.moveTo(p[0], p[1]);
            }
            ctx.closePath()
            ctx.fill("nonzero");
            ctx.stroke();
        }
    }
}

function ignite() {
    canvas_element = $('.canvas')[0]
    state.context = canvas_element.getContext('2d');
    console.log(state.context)
    canvas_element.addEventListener('mousedown', turn_on)
    canvas_element.addEventListener('mouseup', turn_off)
    canvas_element.addEventListener('mouseleave', turn_off)
    canvas_element.addEventListener('mouseout', turn_off)
    canvas_element.addEventListener('mousemove', onmove)
}
