// varying vec3 vPosition;
// varying vec3 vColor;
uniform vec3 color;

void main() {

    // float alpha = 7. - abs(distance(vPosition.xy, vec2(.0)));

    gl_FragColor = vec4( color , .4 );
    // gl_FragColor = gl_FragColor * texture2D( texture, vUv );
}