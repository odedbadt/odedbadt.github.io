import FFT from 'fft.js';
import { fft,format, Complex} from 'mathjs'
function fft_shift(array) {
    const n = array.length;
    const half = Math.floor(n / 2);

    // For odd lengths, include the middle element in the right half
    const left = array.slice(0, half);
    const right = array.slice(half);

    return right.concat(left);
}

class App {
    constructor(n) {
        this.dpr = 1;// window.devicePixelRatio;
        this.n = n
        this.signal = new Float64Array(n)
        for (let j = 0; j < n; ++j) {
            this.signal[j]= Math.cos(j/n*Math.PI*20.1)*Math.exp(-(j-n/2)*(j-n/2)/1000);
        }
        this.init()
    }
    init_canvas_sizes() {
        const signal_canvas_element = document.getElementById('sketcher');
        const signal_rect = signal_canvas_element.getBoundingClientRect();
        signal_canvas_element.width = signal_rect.width * this.dpr;
        signal_canvas_element.height = signal_rect.height * this.dpr;        
        this.h = signal_rect.height * this.dpr;
        this.w = signal_rect.width * this.dpr;
    }
    init() {
        this.init_function_sketcher()
        this.init_main_loop();
        this.init_canvas_sizes();
        this._prev_idx = null
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
    sample_a_half(unshifted_signal) {
        const result = new Array(this.n)
        for (let j = 0; j < this.n; ++j) {
            const c1 = unshifted_signal[Math.floor(j/2)] // Complex
            const c2 = unshifted_signal[Math.ceil(j/2)] // Complex
            result[j] = new Complex(c1.re+c2.re/2,(c1.im+c2.im)/2)
        }
        return result;
    }
    draw_fft() {
        const draw_signal = (context, signal, h, shift, scale, log) => {
            context.fillStyle="white"
            context.beginPath()
            context.fillRect(0,0,this.w,this.h)
            context.fill()
            context.strokeStyle='rgb(150,40,40)';
            for (let y = -1; y < 1; y+=.25) {
                context.beginPath()
                context.moveTo(0,this.signal_y_to_canvas_y(y))
                context.lineTo(this.n,this.signal_y_to_canvas_y(y))
                context.stroke();
            }
            context.beginPath()
            context.strokeStyle='grey';


            context.moveTo(this.signal_index_to_canvas_x(0), this.signal_y_to_canvas_y(signal[0]))
            for (let j = 0; j < this.n; j++) {
                const x = this.signal_index_to_canvas_x(j)
                const y = this.signal_y_to_canvas_y(signal[j])
                context.lineTo(x, y)
            }
            context.stroke()
            context.beginPath()
            // if (loop) {
            //     context.strokeStyle='rgb(83, 141, 162)';

            //     context.moveTo(this.signal_index_to_canvas_x(this.n-20), this.signal_y_to_canvas_y(signal[0]))
            //     for (let j = 0; j < 20; j++) {
            //         const x = this.signal_index_to_canvas_x(this.n-20+j)
            //         const y = this.signal_y_to_canvas_y(signal[j])
            //         context.lineTo(x, y)
            //     }            
            //     context.moveTo(this.signal_index_to_canvas_x(0), this.signal_y_to_canvas_y(signal[this.n-20]))
            //     for (let j = 0; j < 20; j++) {
            //         const x = this.signal_index_to_canvas_x(j);
            //         const y = this.signal_y_to_canvas_y(signal[this.n-20+j])
            //         context.lineTo(x, y)
            //     }            
            //     context.stroke()
            // }

        }
        const l = this.signal.length
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
        this.fft_result = this.sample_a_half(fft(fft_shift(Array.from(this.signal))));
        this.real_output =this.fft_result.map(complex => complex.re);
        this.imag_output =this.fft_result.map(complex => complex.im);
        this.abs_output = this.fft_result.map(complex => complex.abs());
        this.arg_output = this.fft_result.map(complex => complex.arg());
        const h = this.signal.length
        draw_signal(real_context, this.real_output, real_canvas.height, true , (h*.25), true);
        draw_signal(imag_context, this.imag_output, imag_canvas.height, true , (h*.25));
        draw_signal(abs_context, this.abs_output, real_canvas.height, true , (h*.1), true);
        draw_signal(arg_context, this.arg_output, imag_canvas.height, true , (h*.25/3.11));
        draw_signal(signal_context, this.signal, signal_canvas.height, false, (h*2), false, true);
        const scale = h*2
        const shift = false;



    }
    init_main_loop() {
        const animate = () => {
            this.draw_fft()      
            requestAnimationFrame(animate)
        }
          requestAnimationFrame(animate)
    }
    canvas_y_to_signal_y(y) {
        return -(y-this.h/2)/(this.h/2)
    }
    signal_y_to_canvas_y(y) {
        return -y*(this.h/2)+this.h/2
    }
    canvas_x_to_signal_index(x) {
        if (x < 0) {
            return 0
        }
        if (x >= this.w) {
            return n-1;
        }
        return Math.floor(this.n*(x/this.w))
    }
    signal_index_to_canvas_x(j) {
        if (j < 0) {
            return 0
        }
        if (j >= this.n) {
            console.log('W');
            return this.w;
        }
        return Math.floor(this.w*(j/this.n))
    }
    init_function_sketcher() {
        const sketcher_canvas = document.getElementById('sketcher')
        const sketcher_context = sketcher_canvas.getContext('2d', {'willreadFrequently': true})
        const h = sketcher_canvas.height;
        const dpr = this.dpr
        const _this = this;
        sketcher_canvas.addEventListener('mousedown', (event) => {
            const px = event.offsetX * dpr;
            const py = event.offsetY * dpr;    
            const idx = this.canvas_x_to_signal_index(px);
            const value = this.canvas_y_to_signal_y(py);       
        // sketcher_context.beginPath()
            // sketcher_context.moveTo(x,h);
            // sketcher_context.lineTo(x,y);
            // sketcher_context.stroke()
            this._prev_idx = px;
            this._prev_y = value;
            this.signal[idx] = value;
        });
        sketcher_canvas.addEventListener('mousemove', (event) => {
            if (1 & event.buttons) {
                const px = event.offsetX * dpr;
                const py = event.offsetY * dpr;    
                const idx = this.canvas_x_to_signal_index(px);
                const value = this.canvas_y_to_signal_y(py);
                    if (this._prev_idx != null) {
                    const sgn = Math.sign(idx - this._prev_idx)
                    for (let j = 0; j < Math.abs(idx - this._prev_idx); ++j) {
                        const interpolation_x = this._prev_idx+j*sgn;
                        const ratio = j / Math.abs(idx - this._prev_idx);
                        const prev_value = this._prev_y;
                        const interpolated_value = value + 
                        (value - prev_value)*ratio
                        this.signal[interpolation_x] = interpolated_value;
                    }
                }
                this._prev_idx = idx;
                this._prev_y = value;
                this.signal[idx] = value;

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
  const app = new App(256)
  app.init();
  window._app = app;
});