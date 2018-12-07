function add_circle(cx, cy) {
    var canvas_element = $('.canvas')[0]
    var context = canvas_element.getContext('2d')
    var color = Color.hsl(Math.random(), 1, 1, 1)
    var delta = 0;
    if (Math.random() > 0.2) {
        delta = 1;
    }
    dr = delta;
    dg = delta;
    db = delta;
    context.fillStyle = color.css();
    var pixel_data = context.getImageData(cx - 15, cy - 15, 30, 30);
    for (var y = -15; y < 15; ++y) {
        for (var x = -15; x < 15; ++x) {
            if (x * x + y * y > 15 * 15) {
                continue;
            }
            var base_offset = ((y + 15) * 30 + x + 15) * 4;
            pixel_data.data[base_offset] =
                ((pixel_data.data[base_offset] || 0) + dr) % 255;
            pixel_data.data[base_offset + 1] =
                ((pixel_data.data[base_offset + 1] || 0) + dg) % 255;
            pixel_data.data[base_offset + 2] =
                ((pixel_data.data[base_offset + 2] || 0) + db) % 255;
            pixel_data.data[base_offset + 3] = 255;
        }
    }
    context.putImageData(pixel_data, cx - 15, cy - 15);
}
function add_random_circle(offsetX, offsetY) {
    var r = Math.random();
    var alpha = Math.random() * 2 * Math.PI;
    r = r * r;
    var cx = offsetX + Math.cos(alpha) * r * 80;
    var cy = offsetY + Math.sin(alpha) * r * 80;
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
    window.setTimeout(add_circle_if_on, 20)
}
var on = false;
function turn_on(event) {
    on = true;
    position = [event.offsetX, event.offsetY]
    add_circle(event)
}

function turn_off() {
    on = false;
}

function ignite() {
    var canvas_element = $('.canvas')[0]
    console.log(canvas_element)
    canvas_element.addEventListener('mousedown', turn_on)
    canvas_element.addEventListener('mouseup', turn_off)
    canvas_element.addEventListener('mouseleave', turn_off)
    canvas_element.addEventListener('mouseoiut', turn_off)
    canvas_element.addEventListener('mousemove', onmove)
    add_circle_if_on()
}
