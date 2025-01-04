import FFT from 'fft.js';
import { fft,format} from 'mathjs'
class App {
    constructor() {
        this.dpr = window.devicePixelRatio;
        this.w = document.getElementById('sketcher').width * this.dpr;
        this.signal = new Float32Array(this.w)

    }
    init() {
        this.init_function_sketcher()
        this.init_main_loop();
        this._prev_x = null
        this._prev_y = null
    
    }
    draw_fft() {
                // Arrays to hold the real and imaginary outputs
        const draw_signal = (context, signal, h, shift, scale) => {
            context.fillStyle="white"
            context.beginPath()
            context.fillRect(0,0,h,h)
            context.fill()
            context.beginPath()
            const shifting_function = (j) => j < signal.length/2 ? j + signal.length/2 : j - signal.length/2
            const x_transfrmation = shift? shifting_function :(x)=> x

            context.moveTo(0, signal[x_transfrmation(0)]*scale+h/2)

            for (let j = 0; j < signal.length; ++j) {

                const shifted = j < signal.length/2 ? j + signal.length/2 : j - signal.length/2
                const v = signal[shift ? shifted : j];
                const scaled = -v*scale+h/2
                context.lineTo(j, scaled)

            }
            context.stroke()
        }
        const l = this.signal.length
        const real = new Float32Array(l);
        const imag = new Float32Array(l);
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
        this.fft_result = fft(Array.from(this.signal));
        this.real_output =this.fft_result.map(complex => complex.re);
        this.imag_output =this.fft_result.map(complex => complex.im);
        this.abs_output = this.fft_result.map(complex => complex.abs());
        this.arg_output = this.fft_result.map(complex => complex.arg());
        const h = this.signal.length
        draw_signal(real_context, this.real_output, real_canvas.height, true , (h*.25));
        draw_signal(imag_context, this.imag_output, imag_canvas.height, true , (h*.25));
        draw_signal(abs_context, this.abs_output, real_canvas.height, true , (h*.25));
        draw_signal(arg_context, this.arg_output, imag_canvas.height, true , (h*.25/3.11));
        draw_signal(signal_context, this.signal, signal_canvas.height, false, (h*2));

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
            this.signal[x] = Math.max(this.signal[x], value)
        });
        sketcher_canvas.addEventListener('mousemove', (event) => {
            if (1 & event.buttons) {
                const x = event.offsetX * dpr;
                if (x<0) {
                    return;
                }                const y = event.offsetY * dpr;
                if (this._prev_x != null) {
                    // sketcher_context.beginPath()
                    // sketcher_context.moveTo(this._prev_x,this._prev_y);
                    // sketcher_context.lineTo(this._prev_x,h);
                    // sketcher_context.lineTo(x,h);
                    // sketcher_context.lineTo(x,y);
                    // sketcher_context.stroke()
                    // sketcher_context.fill()
                    const sgn = Math.sign(x - this._prev_x)
                    for (let j = 0; j < Math.abs(x - this._prev_x); ++j) {
                        const interpolation_x = this._prev_x+j*sgn;
                        const value_in_prev_x = this.signal[this._prev_x];
                        const value = -(y - h / 2)/(h*2);
                        const ratio = j / Math.abs(x - this._prev_x);
                        const interpolated_value = value_in_prev_x*ratio + value*(1 - ratio);
                        const prev_value_in_interpolation_x = this.signal[x+j*sgn]
                            
                        this.signal[interpolation_x] = interpolated_value

                    }
                    
                    
                }
                this._prev_x = x;
                this._prev_y = y;
                this.signal[x] = -(y - h/2)/(h*2)

            }

        });
        const logger = (event) =>{
            const x = event.offsetX * dpr;
            const v = x < this.w/2 ? x + this.w/2 : x - this.w/2
            const complex_value = this.fft_result[v];

            document.getElementById('log').innerHTML = 
            `The value at ${(x-this.w/2)/this.w} is ${format(complex_value,2)} (abs: ${format(complex_value.abs(),2)}, arg: ${format(complex_value.arg(),2)})   `;
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