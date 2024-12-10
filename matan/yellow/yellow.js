import { MANDEL_FRAGMENT_SHADER, JULIA_FRAGMENT_SHADER, VERTEX_SHADER } from "./shaders.js";
var canvas;
var camera, scene, renderer;
var uniforms;


function init() {
    const mandel_canvas = document.getElementById('mandel-canvas' );
    const mandel_context = mandel_canvas.getContext('webgl');
    camera = new THREE.Camera();
    camera.position.z = 1;

    scene = new THREE.Scene();

    var geometry = new THREE.PlaneBufferGeometry( 2, 2 );

    uniforms = {
        u_time: { type: "f", value: 1.0 },
        u_resolution: { type: "v2", value: new THREE.Vector2() },
        u_mouse: { type: "v2", value: new THREE.Vector2() }
    };

    var material = new THREE.ShaderMaterial( {
        uniforms: uniforms,
        vertexShader: VERTEX_SHADER,      //document.getElementById( 'vertexShader' ).textContent,
        fragmentShader: MANDEL_FRAGMENT_SHADER   //document.getElementById( 'fragmentShader' ).textContent
    } );

    var mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

    const renderer = new THREE.WebGLRenderer({
        canvas: mandel_canvas,
        context: mandel_context
    })
    renderer.setPixelRatio( window.devicePixelRatio );

    //mandel_canvas.appendChild( renderer.domElement );

    function onWindowResize( event ) {
        renderer.setSize( mandel_canvas.clientWidth, mandel_canvas.clientHeight );
        console.log(renderer.domElement.clientHeight)
        uniforms.u_resolution.value.x = renderer.domElement.width;
        uniforms.u_resolution.value.y = renderer.domElement.height;
    }
    onWindowResize();
    
    window.addEventListener( 'resize', onWindowResize, false );

    mandel_canvas.onmousemove = function(e){
      uniforms.u_mouse.value.x = e.clientX;
      uniforms.u_mouse.value.y = e.clientY;
    }

    function render() {
        renderer.render( scene, camera );
    }
    function animate() {
        requestAnimationFrame( animate );
        render();
    }
    animate()

}




export function app_ignite() {
    // (window as any).app = new MainApp();
    // (window as any).app.init();
    init();
}

window.addEventListener('load', app_ignite);
