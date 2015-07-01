varying float vColor;

varying float vAlpha;

uniform vec3 color1;
uniform vec3 color2;
uniform float hardness;

void main() {

    float d = length(gl_PointCoord.xy - .5) * 2.0;
    float c = 1.0 - smoothstep(hardness, 1.0, d);
    // float c = 1.0 - d;

    gl_FragColor = vec4(mix(
        color1,
        color2,
        vColor) * c, 1.0) * vAlpha;

    // gl_FragColor = vec4(color1 * vColor * c, vAlpha);

}
