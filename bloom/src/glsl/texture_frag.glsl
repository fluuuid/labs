uniform sampler2D tDiffuse; 
uniform float time;
varying vec2 vUv;

void main()
{
    // gl_FragColor = texture2D(tDiffuse, vUv);
    gl_FragColor = vec4(1.);
}