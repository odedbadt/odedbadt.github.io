import { MANDEL_FRAGMENT_SHADER, JULIA_FRAGMENT_SHADER, VERTEX_SHADER } from "./shaders.js";
var container;
var camera, scene, renderer;
var uniforms;

function init() {
    const mandel_container = document.getElementById('mandel-container' );

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

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );

    mandel_container.appendChild( renderer.domElement );

    function onWindowResize( event ) {
        renderer.setSize( mandel_container.clientWidth, mandel_container.clientHeight );
        console.log(renderer.domElement.clientHeight)
        uniforms.u_resolution.value.x = renderer.domElement.width;
        uniforms.u_resolution.value.y = renderer.domElement.height;
    }
    onWindowResize();
    
    window.addEventListener( 'resize', onWindowResize, false );

    mandel_container.onmousemove = function(e){
      uniforms.u_mouse.value.x = e.clientX;
      uniforms.u_mouse.value.y = e.clientY;
    }

    function render() {
        uniforms.u_time.value += 0.05;
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
