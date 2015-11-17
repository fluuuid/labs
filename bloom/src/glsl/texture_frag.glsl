uniform sampler2D tDiffuse; 
uniform float time;
varying vec2 vUv;

void main()
{
    vec2 pos = vUv;
    pos.s = time;
    gl_FragColor = texture2D(tDiffuse, pos);
}