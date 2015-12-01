uniform sampler2D tDiffuse; 
uniform float time;
varying vec2 vUv;

void main()
{
    vec4 texel = texture2D(tDiffuse, vUv);
    gl_FragColor = 1. * texel;
    // gl_FragColor = vec4(1.);
}