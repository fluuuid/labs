#pragma glslify: fxaa = require('./fxaa.glsl')

varying vec2 vUv;
uniform sampler2D tDiffuse;
uniform vec2 resolution;

void main() {

    vec2 fragCoord = vUv * resolution;
    vec4 texel = fxaa(tDiffuse, fragCoord, resolution);

    vec2 res = (gl_FragCoord.xy / resolution.xy) - vec2(0.5);
    res.x *= resolution.x / resolution.y;

    // vec4 texel = texture2D( tDiffuse, vUv );

    // vignette
    // float len = length(res);
    // float vignette = smoothstep(.85, .5, len);
    // texel = pow(texel, vec4(3.)) * vignette;

    gl_FragColor = texel;

}
