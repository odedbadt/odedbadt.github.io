export const MANDEL_FRAGMENT_SHADER = `
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

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
    float zoom = 0.5*min(u_resolution.x, u_resolution.y);
    vec2 coord = (gl_FragCoord.xy - u_resolution.xy/2.0)/zoom;
    float M = loop(vec2(0.0,0.0), vec2(coord.x, coord.y));
    float R = M;
    float G = 0.0;
    float B = 0.0;
    gl_FragData[0] = vec4(R, G, B, 1.0);
}
`
export const JULIA_FRAGMENT_SHADER = `
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

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
    vec2 coord = 4.0 * (( gl_FragCoord.xy / u_resolution.y ) -0.5);
    vec2 mouse = 4.0 * (( u_mouse.xy / u_resolution.y ) - 0.5);
    mouse.y = -mouse.y;
    vec2 offset = vec2(3.85,0.0);
    vec2 coord_p = coord + offset;
    vec2 mouse_p = mouse + offset;
    vec2 coord_m = coord - offset;
    vec2 mouse_m = mouse - offset;
    vec2 origin = vec2(0.0, 0.0);
    float J = loop(coord, mouse_m);
    float M = loop(origin, coord_m);
    float V = min(M, J);
    float R = V;
    float G = V;
    float B = 0.0;
    //float alpha = 1.0;
    if (abs(mouse.x - coord.x) <= 0.004) {
        G = 0.0;
        R = 1.0;
    }
    if (abs(mouse.y - coord.y) <= 0.004) {
        G = 0.0;
        R = 1.0;
    }
    if ((abs(coord_m.x) <= 0.004) && (abs(coord_m.y) < 0.2)) {
        G = 1.0;
        R = 0.0;
    }
    if ((abs(coord_m.y) <= 0.004) && (abs(coord_m.x) < 0.2)) {
        G = 1.0;
        R = 0.0;
    }
    gl_FragData[0] = vec4(R, G, B, 1.0);
}
`
export const VERTEX_SHADER = `
void main() {
    gl_Position = vec4( position, 1.0 );
}
`
