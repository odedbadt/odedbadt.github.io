import { VS_SOURCE, FS_SOURCE, FS_SOURCE_MIRRORS, FS_SOURCE_NO_TEXTURE } from './glsl.js'
import * as RenderUtils from './render_utils.js'
export class App {
  constructor(model, spinning_speed, pen_color, pen_radius) {
    this.model = model;
    this.spinning_speed = spinning_speed || 0;
    this.is_spinning = this.spinning_speed && this.spinning_speed > 0;
    this.alpha = 0;
    this.pen_color = pen_color || 'black'
    this.pen_radius = pen_radius || 5
    this.dpr = window.devicePixelRatio || 1;
    this.cache = localStorage;
  }
  construct_url_for_name(model_name) {
    return `/static/models/${model_name}.json`
  }
  warmup_cache(model_names) {
    const _this = this;
    Array.from(model_names).forEach((model_name) => {
      _this.load_model(_this.construct_url_for_name(model_name), (model) => {
        this.cache.setItem(model_name, model)
      })
    })
  }
  load_spinner_model() {
    const _this = this;
    this.load_model(this.construct_url_for_name('spinner'), (model) => {
      _this.spinner_model = model;
    });
  }
init() {
  const _this = this;
  this.load_model_names((model_names) => {
    _this.model_names = model_names;
    _this.cache.setItem('all_model_names', model_names);
    const model_entries = []
    for (const model_name of model_names) {
      model_entries.push({name: model_name})
    }
    // Warmup cache
    this.warmup_cache(model_names);
    this.load_spinner_model();
    new Vue({
      el: '#model-select',
      data: {
        model_entries: model_entries
      }
    })
    const model_select_element = document.getElementById('model-select')
    model_select_element.addEventListener('change', (event) => {
      _this.load_and_set_model(model_select_element.value);
    });
    const first_model = this.model_names[0];
    this.load_and_set_model(first_model);

    const clear_btn = document.getElementById('clear-button');
    clear_btn.addEventListener('click', () => window.main_app.clear());
    const cache_clear_btn = document.getElementById('clear-cache');
    cache_clear_btn.addEventListener('click', () => localStorage.clear());

    //clear-cache
  })
}
load_model(model_url, callback) {
  if (this.cache.getItem(model_url)) {
    callback(this.cache.getItem(model_url));
    return
  }
  fetch(`${model_url}#'${Date.now()}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json(); // Parse JSON from the response
    })
    .then(data => {
      callback(data); // Handle the JSON data
    })
    .catch(error => {
      console.error('Error fetching data:', error); // Handle errors
    });
}
load_model_names(callback) {
  const cache_key = 'model_list';
  if (this.cache.getItem(cache_key)) {
    callback(this.cache.getItem(cache_key));
    return
  }
  fetch(`/static/models/models.txt#'${Date.now()}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.text(); // Parse JSON from the response
    })
    .then(data => {
      const model_names = data.split(',');
      this.cache.setItem(cache_key, model_names)
      callback(model_names); // Handle the JSON data
    })
    .catch(error => {
      console.error('Error fetching data:', error); // Handle errors
    });
}

load_and_set_model(model_name) {

  if (this.interval_id) {
    window.clearInterval(this.interval_id);
  }
  const shape_name_element = document.getElementById('shape-name');
  shape_name_element.innerHTML = 'Loading...';
  if (this.spinner_model) {
    this.set_model(this.spinner_model);
  }
  this.set_spinning_speed(.35);
  const _this = this
  this.load_model(this.construct_url_for_name(model_name),
    (model) => {
      _this.cache.setItem(model_name, model);
      _this.set_model(model)
      _this.set_spinning_speed(0);
      _this.init_and_draw();
      shape_name_element.innerHTML = model_name
    })
};
set_spinning_speed(spinning_speed) {
  this.spinning_speed = spinning_speed || 0
  this.is_spinning = this.spinning_speed > 0
  //this.spin_and_draw();
}
set_model(model) {
  this.model = model;
  this.path = null;
  this.mirror_path = null;

  //this.draw_model();
}
init_and_draw() {
  const main_canvas = document.getElementById("mainCanvas");
  this.init_canvas_sizes();

  this.init_palette();
  this.init_texture_sketcher();
  this.init_pen_selector();
  this.draw_model()

  main_canvas.addEventListener("click", (event) => {
    if (this.interval_id) {
      clearInterval(this.interval_id);
    }
    this.is_spinning = !this.is_spinning;
    if (this.is_spinning) {
      this.spinning_speed = 0.05
      this.interval_id = setInterval(this.spin_and_draw.bind(this), 100);
    } else if (this.interval_id) {
      clearInterval(this.interval_id);
    }
    event.stopPropagation()
    event.stopImmediatePropagation();
  });
  if (this.interval_id) {
    clearInterval(this.interval_id);
  }
  console.log(this.model)
  this.interval_id = setInterval(this.spin_and_draw.bind(this), 100);

};
init_canvas_sizes() {
  const dpr = this.dpr;
  const set_size = () => {
    const canvas_elements = document.getElementsByTagName('canvas');
    for (const canvas_element of canvas_elements) {
      const rect = canvas_element.getBoundingClientRect();
      if (canvas_element.id == 'mainCanvas') {
        canvas_element.width = rect.width * dpr;
        canvas_element.height = rect.height * dpr;
        this.draw_model()
      } else {
        const canvas_context = canvas_element.getContext('2d', {'willReadFrequently': true});
        const imageData = canvas_context.getImageData(0, 0, canvas_element.width, canvas_element.height);
        canvas_element.width = rect.width * dpr;
        canvas_element.height = rect.height * dpr;
        canvas_context.putImageData(imageData, 0, 0);

      }
    }
  }
  set_size()
  const resize_observer = new ResizeObserver(entries => {
    entries.forEach((_) => { set_size() });
  })
  set_size();
  document.querySelectorAll('body').forEach((body_element) => {
    resize_observer.observe(body_element);
  })

}
init_palette() {
  const palette_canvas = document.getElementById("paletteCanvas");
  const palette_context = palette_canvas.getContext('2d');
  var img = new Image();
  img.src = "/static/palette.png"; // Replace with the path to your image
  const dpr = this.dpr;
  img.onload = () => {
    palette_context.drawImage(img, 0, 0, 25, 200, 0, 0,
      palette_canvas.width, palette_canvas.height);
  }
  palette_canvas.onclick = (event) => {
    const color = palette_context.getImageData(event.offsetX * dpr, event.offsetY * dpr, 1, 1).data;
    this.pen_color = `rgb(${color[0]},${color[1]},${color[2]})`;
    this.draw_pen_selector()
  }
}
draw_pen_selector() {
  const pen_canvas = document.getElementById("penCanvas");
  const pen_context = pen_canvas.getContext('2d', { willReadFrequently: true });
  const pen_canvas_rect = pen_canvas.getBoundingClientRect();
  const width = pen_canvas_rect.width * this.dpr;
  const height = pen_canvas_rect.height * this.dpr;

  pen_context.clearColor = 'black'
  pen_context.clearRect(0, 0, pen_canvas.width, pen_canvas.height)
  pen_context.fillStyle = this.pen_color
  pen_context.strokeStyle = 'white'
  pen_context.beginPath()
  pen_context.moveTo(width, 0)
  pen_context.lineTo(width, height)
  pen_context.lineTo(width / 2, height)
  pen_context.lineTo(width, 0)
  pen_context.fill()
  pen_context.stroke()
  pen_context.beginPath()
  const bak_globalCompositeOperation = pen_context.globalCompositeOperation;
  pen_context.globalCompositeOperation = "xor"
  const slope = pen_canvas_rect.width / 2 / pen_canvas_rect.height;

  pen_context.ellipse(width - this.pen_radius * this.dpr,
    this.dpr * this.pen_radius * 2 / slope,
    this.pen_radius * this.dpr,
    this.pen_radius * this.dpr,
    0, 0, Math.PI * 2)
  pen_context.fill()
  pen_context.stroke()
  pen_context.globalCompositeOperation = bak_globalCompositeOperation
}
init_pen_selector() {
  this.draw_pen_selector();
  const pen_canvas = document.getElementById("penCanvas");
  const pen_canvas_rect = pen_canvas.getBoundingClientRect();
  const dpr = this.dpr;
  const slope = pen_canvas_rect.width / 2 / pen_canvas_rect.height;
  pen_canvas.addEventListener("mousemove", (event) => {
    if (event.buttons) {
      const pen_canvas_y = event.offsetY;
      this.pen_radius = pen_canvas_y * slope / 2;
      this.draw_pen_selector()
    }
  });
}
clear() {
  const texture_canvas = document.getElementById("textureCanvas");
  const texture_context = texture_canvas.getContext('2d', { willReadFrequently: true });
  const w = texture_canvas.width;
  const h = texture_canvas.height;
  texture_context.fillStyle = 'white';
  texture_context.fillRect(0, 0, w, h);
  this.draw_model();
}
init_texture_sketcher() {
  const texture_canvas = document.getElementById("textureCanvas");
  const texture_context = texture_canvas.getContext('2d', { willReadFrequently: true });
  texture_context.fillStyle = "white";
  texture_context.fillRect(0, 0,
    texture_canvas.width, texture_canvas.height);
  // const frame_texture = () {
  //   texture_context.lineWidth = 3;
  //   texture_context.fillStyle = "black";
  //   texture_context.beginPath();
  //   texture_context.moveTo(texture_canvas.width, 0);
  //   texture_context.lineTo(texture_canvas.width, texture_canvas.height);
  //   texture_context.lineTo(0, texture_canvas.height);
  //   texture_context.lineTo(texture_canvas.width, 0);
  //   texture_context.fill();
  //   texture_context.strokeStyle = "blue";
  //   texture_context.beginPath();
  //   texture_context.moveTo(texture_canvas.width, 0);
  //   texture_context.lineTo(0, texture_canvas.height);
  //   texture_context.lineTo(0, 0);
  //   texture_context.lineTo(texture_canvas.width, 0);
  //   texture_context.stroke();
  // }
  //frame_texture()

  const w = texture_canvas.width;
  const h = texture_canvas.height;
  const dpr = this.dpr;
  const mouse_event_to_coordinates = (event) => {
    const canvas_x = event.offsetX;
    const canvas_y = event.offsetY;
    return [canvas_x * dpr, canvas_y * dpr];
    return [event.offsetX, event.offsetY];
  }
  const mirror_coordinates = (coords) => {
    return [w - coords[1], h - coords[0]]
  }
  const dist2 = (v1, v2) => {
    const mn = [v1[0] - v2[0], v1[1] - v2[1]];
    return mn[0] * mn[0] + mn[1] * mn[1];
  }
  texture_canvas.addEventListener("mousedown", (event) => {
    this.path = new Path2D();
    this.mirror_path = new Path2D();
    texture_context.strokeStyle = this.pen_color;
    texture_context.lineWidth = this.pen_radius * 2;
    const coords = mouse_event_to_coordinates(event);
    this.prev_coords = [coords[0], coords[1]]
    const mirror_coords = mirror_coordinates(coords);
    this.path.moveTo(coords[0], coords[1])
    this.mirror_path.moveTo(mirror_coords[0], mirror_coords[1])
  })
  texture_canvas.addEventListener("mouseup", (event) => {
    if (this.path) {
      texture_context.stroke(this.path);
      this.path = null;
      texture_context.stroke(this.mirror_path);
      this.mirror_path = null;
    }
  })

  texture_canvas.addEventListener("mousemove", (event) => {
    const coords = mouse_event_to_coordinates(event);
    const mirror_coords = mirror_coordinates(coords);
    if (event.buttons) {
      if (this.path && this.mirror_path) {
        if (dist2(coords, this.prev_coords) * dpr * dpr > 10) {
          this.path.lineTo(coords[0], coords[1]);
          this.mirror_path.lineTo(mirror_coords[0], mirror_coords[1]);
          texture_context.stroke(this.path)
          texture_context.stroke(this.mirror_path)
        } else {
          this.path.moveTo(coords[0], coords[1]);
          this.mirror_path.moveTo(mirror_coords[0], mirror_coords[1]);

        }
      }
      this.prev_coords = [coords[0], coords[1]];

      texture_context.beginPath();
      texture_context.ellipse(coords[0], coords[1], this.pen_radius, this.pen_radius, 0, 0, Math.PI * 2)
      texture_context.fill();
      texture_context.stroke();
      texture_context.fillStyle = this.pen_color;
      texture_context.lineWidth = 0;
      texture_context.beginPath();

      texture_context.ellipse(mirror_coords[0], mirror_coords[1], this.pen_radius, this.pen_radius, 0, 0, Math.PI * 2)
      texture_context.fill();
      this.draw_model();
    }

  })

}
draw_model() {
  const texture_canvas = document.getElementById("textureCanvas");
  const main_canvas = document.getElementById("mainCanvas");
  const main_gl = main_canvas.getContext("webgl2");

  RenderUtils.bindTextureToProgram(main_gl, texture_canvas);


  const x_axis = [1, 0, 0];
  const y_axis = [0, 1, 0];

  const rotation_matrix_4x4 = glMatrix.mat4.create();
  glMatrix.mat4.rotate(rotation_matrix_4x4, rotation_matrix_4x4, this.alpha, y_axis);
  glMatrix.mat4.rotate(rotation_matrix_4x4, rotation_matrix_4x4, Math.PI / 3, x_axis);

  const viewMatrix = glMatrix.mat4.create();
  glMatrix.mat4.lookAt(viewMatrix, [0, 0, 6], [0, 0, 0], [0, 1, 0]);
  const projectionMatrix = glMatrix.mat4.create();
  glMatrix.mat4.perspective(projectionMatrix, Math.PI * 0.15, 1, 1, 10.0);

  glMatrix.mat4.multiply(projectionMatrix, projectionMatrix, viewMatrix)

  const rotationMatrix3x3 = glMatrix.mat3.create();
  glMatrix.mat3.fromMat4(rotationMatrix3x3, rotation_matrix_4x4);
  const uniforms = {
    "projector": {
      type: 'uniformMatrix4fv',
      value: projectionMatrix
    },
    "model_transformer": {
      type: 'uniformMatrix3fv',
      value: rotationMatrix3x3
    },

  }
  //RenderUtils.clear(main_gl)
  const main_shader_program = RenderUtils.build_program(main_gl, VS_SOURCE, FS_SOURCE, true,
    texture_canvas.width, texture_canvas.height);
  if (document.getElementById('model').checked) {
    RenderUtils.draw_model(main_gl, main_shader_program, uniforms,
      this.model)
    RenderUtils.unbind_data(main_gl)
  }
  const mirror_shader_program = RenderUtils.build_program(main_gl, VS_SOURCE, FS_SOURCE_MIRRORS, false,
    texture_canvas.width, texture_canvas.height);

  if (this.model.mirrors) {
    if (document.getElementById('all-mirrors').checked) {
      RenderUtils.draw_model(main_gl, mirror_shader_program, uniforms,
        {
          "vertices": this.model.mirrors,
          "normals": this.model.mirror_normals
        })
    } else if (document.getElementById('generating-mirrors').checked) {
      RenderUtils.draw_model(main_gl, mirror_shader_program, uniforms,
        {
          "vertices": this.model.mirrors,
          "normals": this.model.mirror_normals
        },
        450)
    }
  }

};
spin_and_draw() {
  if (typeof (this.spinning_speed) === 'number') {
    this.alpha = this.alpha + this.spinning_speed;
  }
  if (this.is_spinning && this.spinning_speed > 0) {
    this.draw_model();
  }
}
}

