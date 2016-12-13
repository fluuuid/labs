uniform vec3 color;

void main() {
    gl_FragColor = vec4( color , 1.0 );
    // gl_FragColor = gl_FragColor * texture2D( texture, vUv );
}