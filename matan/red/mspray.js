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

function onmove(event) {
    console.log('A')
    if (state.on) {
        state.points.push([event.offsetX, event.offsetY])

        var ctx = state.context;
        var points = state.points;
        ctx.strokeStyle = 'red';
        ctx.fillStyle='#FAA';
        ctx.beginPath()
        ctx.moveTo(points[0][0], points[0][1])
        for (i = 0; i < state.points.length; ++i) {
            ctx.lineTo(points[i][0], points[i][1])

        }
        ctx.closePath()
        ctx.fill("nonzero");
        ctx.stroke();
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
