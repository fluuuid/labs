#pragma glslify: cnoise3 = require(glsl-noise/classic/3d) 

varying vec2 vUv;
uniform float uTime;
uniform float uDelta;
uniform float index;

void main() {
    vUv = uv;
    float noise = (cnoise3(position) + index / 10.) * (1. + sin(uTime* 1.));
    vec3 pos = position + noise * normalize(position);
    // pos.z += noise * normalize(position.z) ;
    // pos.z += noise * normalize(position.z) ;
    // pos.y += uv.x + sin(time);

    vec4 mvPosition = modelViewMatrix * vec4(pos , 1.0 );
    gl_Position = projectionMatrix * mvPosition;
}

