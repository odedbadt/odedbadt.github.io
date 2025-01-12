import { NEWTON_FRAGMENT_SHADER, VERTEX_SHADER } from "./shaders.js";
import { derivate } from mathjs


function init() {
    const newton_canvas = document.getElementById('newton-canvas' );
    const newton_context = newton_canvas.getContext('webgl2');
    const camera = new THREE.Camera();
    camera.position.z = 1;

    const newton_scene = new THREE.Scene();

    var geometry = new THREE.PlaneBufferGeometry( 2, 2 );

    const newton_uniforms = {
        u_time: { type: "f", value: 1.0 },
        u_resolution: { type: "v2", value: new THREE.Vector2() },
        u_mouse_coord: { type: "v2", value: new THREE.Vector2() },
        u_zoom: { type: "f", value: 1.0 },
    };
    const newton_material = new THREE.RawShaderMaterial( {
        uniforms: newton_uniforms,
        vertexShader: VERTEX_SHADER,      //document.getElementById( 'vertexShader' ).textContent,
        fragmentShader: NEWTON_FRAGMENT_SHADER   //document.getElementById( 'fragmentShader' ).textContent
    } );

    newton_scene.add( new THREE.Mesh( geometry, newton_material ) );

    const newton_renderer = new THREE.WebGLRenderer({
        canvas: newton_canvas,
        context: newton_context
    })
    newton_renderer.setPixelRatio( window.devicePixelRatio );


    function render() {
        newton_renderer.render( newton_scene, camera );

    }
    function animate() {
        requestAnimationFrame( animate );
        render();
    }
    function onWindowResize( event ) {
        newton_renderer.setSize( newton_canvas.clientWidth, newton_canvas.clientHeight );
        newton_uniforms.u_resolution.value.x = newton_canvas.width;
        newton_uniforms.u_resolution.value.y = newton_canvas.height;
        newton_uniforms.u_zoom.value = 100;
        render();
    }
    onWindowResize();
    
    window.addEventListener( 'resize', onWindowResize, false );

    newton_canvas.onmousemove = function(e){
        console.log(e.offsetX,newton_renderer.domElement.width/2)


        newton_uniforms.u_mouse_coord.value.x = e.offsetX*window.devicePixelRatio;
        newton_uniforms.u_mouse_coord.value.y = e.offsetY*window.devicePixelRatio;
        document.getElementById('polynomial').innerHTML = ''

    }

    render()

}




export function app_ignite() {
    // (window as any).app = new MainApp();
    // (window as any).app.init();
    init();
}

window.addEventListener('load', app_ignite);
