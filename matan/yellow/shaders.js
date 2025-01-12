export const MANDEL_FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform float u_zoom;
uniform vec2 u_mouse_coord;

out vec4 fragColor;
const int MAX_ITERACTIONS = 1000;
const float SQUARED_BAILOUT = 4.0;
vec2 square(vec2 v) {
    float w = v.x * v.x - v.y * v.y;
    float z = 2.0 * v.x * v.y;
    return vec2(w, z);
}
float norm2(vec2 v) {
    return v.x * v.x + v.y * v.y;
}
float loop(vec2 S, vec2 P) {
    int C = MAX_ITERACTIONS;
    vec2 A = S;
    for (int i = 0; i < MAX_ITERACTIONS; i++) {
    if (norm2(A) > SQUARED_BAILOUT) {
        break;
    }
    A = square(A) + P;
    C = C - 1;
    }
    return pow(float(C) / float(MAX_ITERACTIONS), 15.0);

}
void main( void ) {
    float zoom = 0.4*min(u_resolution.x, u_resolution.y);
    vec2 coord = (gl_FragCoord.xy - u_resolution.xy/2.0) / u_zoom;
    float M = loop(vec2(0.0,0.0), vec2(coord.x, coord.y));
    float R = M;
    float G = M;
    float B = 0.0;
    float screen_y = u_resolution.y- gl_FragCoord.y;

    if ((abs(coord.x) < 1.0/u_zoom) || (abs(coord.y) < 1.0/u_zoom)) {
        R = 0.0;
        G = 0.0;
        B = 1.0;

    }
    if (
        (abs(u_mouse_coord.x - gl_FragCoord.x) < 1.0 || 
         abs(screen_y - u_mouse_coord.y) < 1.0)  &&
            (abs(u_mouse_coord.x - gl_FragCoord.x) + 
            abs(screen_y - u_mouse_coord.y) < 40.0))
             {
        R = 1.0;
        G = 0.0;
        B = 0.0;

    }
    fragColor = vec4(R, G, B, 1.0);
}
`
export const JULIA_FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform vec2 u_julia_param;
uniform float u_zoom;
out vec4 fragColor;

const int MAX_ITERACTIONS = 1000;
const float SQUARED_BAILOUT = 4.0;
vec2 square(vec2 v) {
    float w = v.x * v.x - v.y * v.y;
    float z = 2.0 * v.x * v.y;
    return vec2(w, z);
}
float norm2(vec2 v) {
    return v.x * v.x + v.y * v.y;
}
float loop(vec2 S, vec2 P) {
    int C = MAX_ITERACTIONS;
    vec2 A = S;
    for (int i = 0; i < MAX_ITERACTIONS; i++) {
    if (norm2(A) > SQUARED_BAILOUT) {
        break;
    }
    A = square(A) + P;
    C = C - 1;
    }
    return pow(float(C) / float(MAX_ITERACTIONS), 15.0);

}
void main( void ) {
    float zoom = 0.4*min(u_resolution.x, u_resolution.y);
    vec2 coord = (gl_FragCoord.xy - u_resolution.xy/2.0) / u_zoom;

    vec2 origin = vec2(0.0, 0.0);
    float J = loop(coord, u_julia_param);
    float R = J;
    float G = J;
    float B = 0.0;
    fragColor = vec4(R, G, B, 1.0);
}
`
export const VERTEX_SHADER = `#version 300 es
precision highp float;

// Vertex attributes
in vec3 position;
void main() {
    gl_Position = vec4( position, 1.0 );
}
`
