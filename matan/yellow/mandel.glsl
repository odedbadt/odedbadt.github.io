
// Author:
// Title:

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

const vec3 WAVE_COLOR = vec3(0.1, 0.1, 0.3);
const vec3 BACK_COLOR = vec3(0.325, 0.375, 0.475);

vec2 square(vec2 v) {
    float w = v.x * v.x - v.y * v.y;
    float z = 2.0 * v.x * v.y;
    return vec2(w, z);
}
float norm2(vec2 v) {
    return v.x * v.x + v.y * v.y;
}
float loop(vec2 S, vec2 P) {
    int C = 256;
    vec2 A = S;
    for (int i = 0; i < 256; i++) {
      if (norm2(A) > 4.0) {
        break;
      }
      A = square(A) + P;
      C = C - 1;
    }
    return float(C) / 256.0;

}
void main( void ) {
    vec2 coord = 4.0 * (( gl_FragCoord.xy / u_resolution.y ) -0.5);
    vec2 mouse = 4.0 * (( u_mouse.xy / u_resolution.y ) - 0.5);
    float J  = loop(coord, mouse);
    float M = loop(vec2(0, 0), coord);
    gl_FragColor = vec4(M, J , J , 1.0);
}
