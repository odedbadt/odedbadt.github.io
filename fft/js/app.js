import FFT from 'fft.js';
import { fft,format} from 'mathjs'
function fft_shift(array) {
    const n = array.length;
    const halfN = Math.floor(n / 2);

    // Create a new array for the result
    const shifted = new Float64Array(n);

    if (n % 2 === 0) {
        // For even-length arrays
        shifted.set(array.subarray(halfN), 0); // Second half to the front
        shifted.set(array.subarray(0, halfN), halfN); // First half to the back
    } else {
        // For odd-length arrays
        shifted.set(array.subarray(halfN + 1), 0); // Second half excluding the middle to the front
        shifted.set(array.subarray(0, halfN + 1), n - halfN - 1); // First half + middle to the back
    }

    return shifted;
}

class App {
    constructor() {
        this.dpr = window.devicePixelRatio;
        this.w = document.getElementById('sketcher').width * this.dpr;
        this.signal = new Float64Array(this.w)
        this.mouse_signal = new Float64Array(this.w)
        this.mouse_signal.fill(null, 0, this.w);

    }
    init() {
        this.init_function_sketcher()
        this.init_main_loop();
        this._prev_x = null
        this._prev_y = null
    
    }
    fft_shift(x) {
        if (x > this.w/2) {
            return x - this.w/2
        }
        return x + this.w/2 
    }
    sym_fft_shift(x) {
        return this.fft_shift(x)
    }
    draw_fft() {
        const draw_signal = (context, signal, h, shift, scale, log) => {
            context.fillStyle="white"
            context.beginPath()
            context.fillRect(0,0,h,h)
            context.fill()
            const x_transfrmation = shift ? this.fft_shift.bind(this) : (x) => x
            const y_transformation = log ? (y) => -Math.sign(y)*Math.log(Math.abs(y*scale))+h/2 : 
                (y) => -y*scale+h/2
            context.moveTo(0, y_transformation(signal[x_transfrmation(0)]))
            context.strokeStyle='rgb(150,40,40)';
            for (let y = Math.floor(-h/scale); y < h/scale; ++y) {
                context.beginPath()
                context.moveTo(0,y_transformation(y)*scale+h/2)
                context.lineTo(h,y_transformation(y)*scale+h/2)
                context.stroke();
            }
            context.beginPath()
            context.strokeStyle='grey';

            const shifted0 = signal[this.fft_shift(0)]
            context.moveTo(0, y_transformation(shift  ? shifted0 : signal[0]))
            for (let j = 0; j < h; j++) {

                const shifted = this.sym_fft_shift(j)
                const v = y_transformation(signal[shift ? shifted : j]);
                
                context.lineTo(j, v)

            }
            context.stroke()
            context.fillStyle='grey';

        }
        const l = this.signal.length
        const real = new Float64Array(l);
        const imag = new Float64Array(l);
        const real_canvas = document.getElementById('real')
        const real_context = real_canvas.getContext('2d', {'willreadFrequently': true})
        const imag_canvas = document.getElementById('imag')
        const imag_context = imag_canvas.getContext('2d', {'willreadFrequently': true})
        const signal_canvas = document.getElementById('sketcher');
        const signal_context = signal_canvas.getContext('2d', {'willreadFrequently': true})
        const abs_canvas = document.getElementById('abs')
        const abs_context = abs_canvas.getContext('2d', {'willreadFrequently': true})
        const arg_canvas = document.getElementById('arg');
        const arg_context = arg_canvas.getContext('2d', {'willreadFrequently': true})


        // const F = FFT;
        // for (let j = 0; j < l; ++j) {
        //     this.signal[j] = Math.sin(j/10); 
        // }
        // const fft = new FFT(l);
        // Perform the FFT
        this.fft_result = fft(Array.from(fft_shift(this.signal)));
        this.real_output =this.fft_result.map(complex => complex.re);
        this.imag_output =this.fft_result.map(complex => complex.im);
        this.abs_output = this.fft_result.map(complex => complex.abs());
        this.arg_output = this.fft_result.map(complex => complex.arg());
        const h = this.signal.length
        draw_signal(real_context, this.real_output, real_canvas.height, true , (h*.25), true);
        draw_signal(imag_context, this.imag_output, imag_canvas.height, true , (h*.25));
        draw_signal(abs_context, this.abs_output, real_canvas.height, true , (h*.1), true);
        draw_signal(arg_context, this.arg_output, imag_canvas.height, true , (h*.25/3.11));
        draw_signal(signal_context, this.signal, signal_canvas.height, false, (h*2));
        const scale = h*2
        const shift = false;



    }
    init_main_loop() {
        const animate = () => {
            this.draw_fft()      
          }
          setInterval(animate, 10)
    }
    init_function_sketcher() {
        const sketcher_canvas = document.getElementById('sketcher')
        const sketcher_context = sketcher_canvas.getContext('2d', {'willreadFrequently': true})
        const h = sketcher_canvas.height;
        const dpr = this.dpr
        const _this = this;
        sketcher_canvas.addEventListener('mousedown', (event) => {
            const x = event.offsetX * dpr;
            if (x<0) {
                return;
            }
            const y = event.offsetY * dpr;
            // sketcher_context.beginPath()
            // sketcher_context.moveTo(x,h);
            // sketcher_context.lineTo(x,y);
            // sketcher_context.stroke()
            this._prev_x = x;
            this._prev_y = y;
            const value = -(y - h / 2)/(h*2);
            this.signal[x] = value;
            this.mouse_signal[x] = value;
        });
        sketcher_canvas.addEventListener('mousemove', (event) => {
            if (1 & event.buttons) {
                const x = event.offsetX * dpr;
                const y = event.offsetY * dpr;
                if (x<0) {
                    return;
                }                
                const value = -(y - h / 2)/(h*2);
                if (this._prev_x != null) {
                    const sgn = Math.sign(x - this._prev_x)
                    for (let j = 0; j < Math.abs(x - this._prev_x); ++j) {
                        const interpolation_x = this._prev_x+j*sgn;
                        const ratio = j/Math.abs(x - this._prev_x);
                        const prev_value = -(this._prev_y - h / 2)/(h*2);
                        const interpolated_value = value + 
                        (value - prev_value)*ratio
                        this.signal[interpolation_x] = interpolated_value;

                    }
                    
                    
                }
                this._prev_x = x;
                this._prev_y = y;
                this.signal[x] = value;
                this.mouse_signal[x] = value;

            }

        });
        const logger = (event) =>{
            const x = event.offsetX * dpr;
            const v = x < this.w/2 ? x + this.w/2 : x - this.w/2
            const complex_value = this.fft_result[v];

            document.getElementById('log').innerHTML = 
            `The value at ${(x-this.w/2)/this.w} is ${format(complex_value,2)} = ${format(complex_value.abs(),2)}exp(${format(complex_value.arg(),2)}𝑖)`;
        }
        const logger_out = (event) => {
            document.getElementById('log').innerHTML = ''
        }
        document.getElementById('real').addEventListener('mousemove', logger);
        document.getElementById('imag').addEventListener('mousemove', logger);
        document.getElementById('abs').addEventListener('mousemove', logger);
        document.getElementById('arg').addEventListener('mousemove', logger);
        document.getElementById('real').addEventListener('mouseout', logger_out);
        document.getElementById('imag').addEventListener('mouseout', logger_out);
        document.getElementById('abs').addEventListener('mouseout', logger_out);
        document.getElementById('arg').addEventListener('mouseout', logger_out);

    }


}

window.addEventListener('load', () => {
  const app = new App()
  app.init();
  window._app = app;
});