import { MANDEL_FRAGMENT_SHADER, JULIA_FRAGMENT_SHADER, VERTEX_SHADER } from "./shaders.js";


function init() {
    const mandel_canvas = document.getElementById('mandel-canvas' );
    const mandel_context = mandel_canvas.getContext('webgl2');
    const julia_canvas = document.getElementById('julia-canvas' );
    const julia_context = julia_canvas.getContext('webgl2');
    const camera = new THREE.Camera();
    camera.position.z = 1;

    const mandel_scene = new THREE.Scene();
    const julia_scene = new THREE.Scene();

    var geometry = new THREE.PlaneBufferGeometry( 2, 2 );

    const mandel_uniforms = {
        u_time: { type: "f", value: 1.0 },
        u_resolution: { type: "v2", value: new THREE.Vector2() },
        u_mouse_coord: { type: "v2", value: new THREE.Vector2() },
        u_zoom: { type: "f", value: 1.0 },
    };
    const julia_uniforms = {
        u_time: { type: "f", value: 1.0 },
        u_resolution: { type: "v2", value: new THREE.Vector2() },
        u_julia_param: { type: "v2", value: new THREE.Vector2(0.3,0.6) },
        u_zoom: { type: "f", value: 1.0 },
    };
    const mandel_material = new THREE.RawShaderMaterial( {
        uniforms: mandel_uniforms,
        vertexShader: VERTEX_SHADER,      //document.getElementById( 'vertexShader' ).textContent,
        fragmentShader: MANDEL_FRAGMENT_SHADER   //document.getElementById( 'fragmentShader' ).textContent
    } );
    const julia_material = new THREE.RawShaderMaterial( {
        uniforms: julia_uniforms,
        vertexShader: VERTEX_SHADER,      //document.getElementById( 'vertexShader' ).textContent,
        fragmentShader: JULIA_FRAGMENT_SHADER   //document.getElementById( 'fragmentShader' ).textContent
    } );

    mandel_scene.add( new THREE.Mesh( geometry, mandel_material ) );
    julia_scene.add( new THREE.Mesh( geometry, julia_material ) );

    const mandel_renderer = new THREE.WebGLRenderer({
        canvas: mandel_canvas,
        context: mandel_context
    })
    mandel_renderer.setPixelRatio( window.devicePixelRatio );
    const julia_renderer = new THREE.WebGLRenderer({
        canvas: julia_canvas,
        context: julia_context
    })
    julia_renderer.setPixelRatio( window.devicePixelRatio );


    function render() {
        mandel_renderer.render( mandel_scene, camera );
        julia_renderer.render( julia_scene, camera );
    }
    function animate() {
        requestAnimationFrame( animate );
        render();
    }
    function onWindowResize( event ) {
        mandel_renderer.setSize( mandel_canvas.clientWidth, mandel_canvas.clientHeight );
        julia_renderer.setSize( julia_canvas.clientWidth, julia_canvas.clientHeight );
        mandel_uniforms.u_resolution.value.x = mandel_renderer.domElement.width;
        mandel_uniforms.u_resolution.value.y = mandel_renderer.domElement.height;
        mandel_uniforms.u_zoom.value = 0.2 * Math.min(
            mandel_renderer.domElement.width, 
            mandel_renderer.domElement.height);

        julia_uniforms.u_resolution.value.x = julia_renderer.domElement.width;
        julia_uniforms.u_resolution.value.y = julia_renderer.domElement.height;
        julia_uniforms.u_zoom.value = 0.2 * Math.min(
            julia_renderer.domElement.width, 
            julia_renderer.domElement.height);
        render();
    }
    onWindowResize();
    
    window.addEventListener( 'resize', onWindowResize, false );

    mandel_canvas.onmousemove = function(e){
        console.log(e.offsetX,mandel_renderer.domElement.width/2)
      julia_uniforms.u_julia_param.value.x = (e.offsetX*window.devicePixelRatio - mandel_renderer.domElement.width/2) / mandel_uniforms.u_zoom.value;
      julia_uniforms.u_julia_param.value.y = -(e.offsetY*window.devicePixelRatio - mandel_renderer.domElement.height/2) / mandel_uniforms.u_zoom.value;
      mandel_uniforms.u_mouse_coord.value.x = e.offsetX*window.devicePixelRatio;
      mandel_uniforms.u_mouse_coord.value.y = e.offsetY*window.devicePixelRatio;
      document.getElementById('julia-param').innerHTML = 
      `Julia param: ${julia_uniforms.u_julia_param.value.x.toFixed(2)}, ${julia_uniforms.u_julia_param.value.y.toFixed(2)}`
    }

    animate()

}




export function app_ignite() {
    // (window as any).app = new MainApp();
    // (window as any).app.init();
    init();
}

window.addEventListener('load', app_ignite);
