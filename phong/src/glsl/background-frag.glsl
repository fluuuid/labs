uniform vec2 resolution;
uniform vec3 color1;
uniform vec3 color2;

varying vec2 vUv;

void main()
{
    vec2 center = vec2(.5);
    float aspect = resolution.x / resolution.y;
    center.x *= aspect;

    vec2 position = vUv;
    position.x *= aspect;

    float dist = distance(center, position);
    gl_FragColor = mix(vec4(color1, 1.), vec4(color2, 1.0), dist * 1.2);
}