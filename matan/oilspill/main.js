const R1 = 30;
const R2 = 80;
const canvas_element = document.getElementById('main-canvas');
const context = canvas_element.getContext('2d', { willReadFrequently: true });
const dpr = 1;//window.devicePixelRatio || 1;

let on = false;
function hsvToRgb(h, s, v) {
    let f = (n, k = (n + h / 60) % 6) => 
        v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
    return [f(5), f(3), f(1)].map(x => Math.round(x * 255));
}
function rgbToHsv(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    let v = Math.max(r, g, b), 
        n = v - Math.min(r, g, b);
    let h = n && (v === r ? (g - b) / n : v === g ? 2 + (b - r) / n : 4 + (r - g) / n);
    return [60 * (h < 0 ? h + 6 : h), v && n / v, v];
}

function log(s) {
    return
    $('#log').text($('#log').text() + '\n' + s);
    if ($('#log').text().length > 100) {
        $('#log').text($('#log').text().slice($('#log').text().length - 100));
    }
}
// function progress_pixel(data, offset) {
//     data[offset] = 0;
//     data[offset + 1] = 0;
//     data[offset + 2] = 0;
// }
// function progress_pixel(data, offset) {
//     for (let j = 0; j < 3; ++j) {
//         let j_1 = (j + 1) % 3;
//         if (data[offset + j] == 255
//             && data[offset + j_1] < 255) {
//                 data[offset + j_1] = data[offset + j_1] + 1;
//         } else if (data[offset + j] <= 255
//             && data[offset + j_1] == 255) {
//                 data[offset + j] = data[offset + j] - 1;
//         }
//     }
// }
// function progress_fire() {
//     const canvas_element = document.getElementById('main-canvas');
//     const context = canvas_element.getContext('2d');
//     let W = window.innerWidth;
//     let H = window.innerHeight;
//     data = context.getImageData(0, 0, W, H);
//     for (let y = H - 1; y >=0; --y) {
//         for (let x = 0; x < W-1; ++x) {
//             let base_offset = (y * W + x) *4;
//             for (let t=0;t<3;++t) {
//                 data[base_offset+t] = (
//                     data[base_offset+t+W*4] +
//                     data[base_offset+t+W*4-1] +
//                     data[base_offset+t+W*4+1]) / 3;
//             }
//         }
//     }
//     context.putImageData(data, 0, 0);

// }

function progress_pixel(data, offset, dp) {
    const hsv = rgbToHsv(data[offset], data[offset+1], data[offset+2])
    const rgb = hsvToRgb((hsv[0] + dp) % 360, hsv[1], hsv[2])
    for (let j = 0; j < 3; ++j) {
        data[offset + j] = rgb[j];
    }
}

function add_circle(cx, cy) {
    let delta = 0;
    if (Math.random() > 0.2) {
        delta = 1;
    }
    dr = delta;
    dg = delta;
    db = delta;
    const pixel_data = context.getImageData(cx - R1 * dpr, 
                                            cy - R1 * dpr, 
                                            R1 * 2 * dpr, 
                                            R1 * 2 * dpr);
    for (let y = -R1 * dpr; y <= R1 * dpr; ++y) {
        for (let x = -R1 * dpr; x <= R1 * dpr; ++x) {
            if (x * x + y * y > R1 * R1 * dpr * dpr) {
                continue;
            }
            const base_offset = ((y + R1 * dpr) * R1 * 2 * dpr + x + R1 * dpr) * 4;
            progress_pixel(pixel_data.data, base_offset, 10*(10-10*Math.sqrt(x*x + y*y)/(R1*dpr)))
            pixel_data.data[base_offset + 3] = 255;
        }
    }
    context.putImageData(pixel_data, cx - R1, cy - R1);
}
function add_random_circle(x, y) {
    const alpha = Math.random() * 2 * Math.PI;
    const r = Math.sqrt(Math.random());
    const cx = x + Math.cos(alpha) * r * R2 * dpr;
    const cy = y + Math.sin(alpha) * r * R2 * dpr;
    add_circle(cx, cy);
}
function onmove(event) {
    position = [event.offsetX, event.offsetY]
    //add_circle_if_on()
}
function turn_on(event) {
    on = true;
    position = [event.offsetX*dpr, event.offsetY*dpr]
//    add_circle(event.offsetX, event.offsetY)
}
// function ontouch(event) {
//   event.stopPropagation();
//   event.preventDefault();
//   on = true;
//   let touches = event.changedTouches;
//   for (let i = 0; i < touches.length; i++) {
//     position = [touches[i].clientX, touches[i].clientY]
//     add_circle(touches[i].clientX, touches[i].clientY);
//   }
// }
function turn_off() {
    on = false;
}
function resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas_element.getBoundingClientRect();
    canvas_element.width = rect.width * dpr;
    canvas_element.height = rect.height * dpr;
    let ctx = canvas_element.getContext('2d');
    ctx.fillStyle = '#A73';
    ctx.fillRect(0, 0, canvas_element.width,canvas_element.height);
}
function main_loop() {
    if (on) {
        add_random_circle(position[0], position[1])
    }
    //progress_fire();
    window.setTimeout(main_loop, 10);
}

function ignite() {
    canvas_element.addEventListener('mousedown', turn_on)
    canvas_element.addEventListener('mouseup', turn_off)
    canvas_element.addEventListener('mouseleave', turn_off)
    canvas_element.addEventListener('mouseoiut', turn_off)
    canvas_element.addEventListener('mousemove', onmove)
    // canvas_element.addEventListener.on("touchstart", ontouch);
    // canvas_element.addEventListener.on("touchmove", ontouch);
    // canvas_element.addEventListener.on("touchend", turn_off);
    window.addEventListener('resize', resize);
    resize();
    main_loop();
}
