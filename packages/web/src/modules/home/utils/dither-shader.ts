export const DITHER_VERTEX = `
attribute vec2 a_position;

void main(){
    gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

/*
 * One pixel per dither cell: a night-to-haze blue ramp from the top edge down, soft drifting haze from
 * a warped noise field, and an 8x8 Bayer matrix that breaks every step of the ramp into grain.
 */
export const DITHER_FRAGMENT = `
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;

float hash(vec2 p){
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

float noise(vec2 p){
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p){
    float value = 0.0;
    float amplitude = 0.5;
    mat2 turn = mat2(1.6, 1.2, -1.2, 1.6);
    for(int octave = 0; octave < 5; octave++){
        value += amplitude * noise(p);
        p = turn * p;
        amplitude *= 0.5;
    }
    return value;
}

float bayer2(vec2 a){
    a = floor(a);
    return fract(dot(a, vec2(0.5, a.y * 0.75)));
}

float bayer8(vec2 a){
    return bayer2(0.25 * a) * 0.0625 + bayer2(0.5 * a) * 0.25 + bayer2(a);
}

vec3 ramp(float x){
    vec3 night = vec3(0.004, 0.008, 0.03);
    vec3 deep = vec3(0.02, 0.07, 0.36);
    vec3 cobalt = vec3(0.06, 0.25, 0.92);
    vec3 sky = vec3(0.38, 0.58, 1.0);
    vec3 haze = vec3(0.88, 0.92, 1.0);
    x = clamp(x, 0.0, 1.0) * 4.0;
    if(x < 1.0) return mix(night, deep, x);
    if(x < 2.0) return mix(deep, cobalt, x - 1.0);
    if(x < 3.0) return mix(cobalt, sky, x - 2.0);
    return mix(sky, haze, x - 3.0);
}

void main(){
    vec2 cell = gl_FragCoord.xy;
    vec2 uv = cell / u_resolution;
    float depth = 1.0 - uv.y;
    vec2 p = vec2(uv.x * u_resolution.x / u_resolution.y, uv.y);
    float t = u_time * 0.02;

    vec2 strand = vec2(p.x * 0.9 + p.y * 0.7, p.y * 2.4 - p.x * 0.45);
    vec2 warp = vec2(fbm(strand * 1.2 + vec2(t, 0.0)), fbm(strand * 1.2 + vec2(3.1, 7.7) - t));
    float haze = smoothstep(0.55, 0.9, fbm(strand * 1.1 - warp + vec2(t, 2.0)));

    float shade = 0.03 + pow(depth, 1.45) * 0.94;
    shade += haze * 0.06;
    shade += (hash(cell) - 0.5) * 0.06;

    float steps = 9.0;
    float level = floor(shade * steps + bayer8(cell)) / steps;
    gl_FragColor = vec4(ramp(level), 1.0);
}
`;
