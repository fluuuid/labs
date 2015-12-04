#pragma glslify: fxaa = require('./fxaa.glsl')

uniform sampler2D map;
uniform vec2 resolution;
varying vec2 vUv;

void main()
{
    vec2 fragCoord = vUv * resolution;
    gl_FragColor = fxaa(map, fragCoord, resolution);
}