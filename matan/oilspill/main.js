var R1 = 20
var R2 = 100
function progress_pixel(data, offset) {

    var r = data[offset];
    var g = data[offset + 1];
    var b = data[offset + 2];
    var color = new Color(r, g, b);
    var hslData = color.hslData();
    var h = (hslData[0] + 0.01) % 1;
    var s = hslData[1];
    var l = hslData[2];
    var rgbData = Color.hsl(h, s, l).rgbData();
    data[offset] = rgbData[0];
    data[offset + 1] = rgbData[1];
    data[offset + 2] = rgbData[2];
}
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
    var pixel_data = context.getImageData(cx - R1, cy - R1, R1*2, R1*2);
    for (var y = -R1; y < R1; ++y) {
        for (var x = -R1; x < R1; ++x) {
            if (x * x + y * y > R1 * R1) {
                continue;
            }
            var base_offset = ((y + R1) * R1*2 + x + R1) * 4;
            progress_pixel(pixel_data.data, base_offset)
            pixel_data.data[base_offset + 3] = 255;
        }
    }
    context.putImageData(pixel_data, cx - R1, cy - R1);
}
function add_random_circle(offsetX, offsetY) {
    var r = Math.random();
    var alpha = Math.random() * 2 * Math.PI;
    r = r * r;
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
    window.setTimeout(add_circle_if_on, R1)
}
var on = false;
function turn_on(event) {
    on = true;
    position = [event.offsetX, event.offsetY]
    add_circle(event.offsetX, event.offsetY)
}

function turn_off() {
    on = false;
}

function ignite() {
    var canvas_element = $('.canvas')[0]
    var ctx = canvas_element.getContext('2d');
    ctx.fillStyle = '#faa';
    ctx.fillRect(0,0,1000,1000);
    console.log(canvas_element)
    canvas_element.addEventListener('mousedown', turn_on)
    canvas_element.addEventListener('mouseup', turn_off)
    canvas_element.addEventListener('mouseleave', turn_off)
    canvas_element.addEventListener('mouseoiut', turn_off)
    canvas_element.addEventListener('mousemove', onmove)
    add_circle_if_on()
}
