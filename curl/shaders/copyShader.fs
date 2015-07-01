uniform vec2 resolution;
uniform sampler2D texture;

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec3 color = texture2D( texture, uv ).xyz;
    gl_FragColor = vec4( color, 1.0 );
}


