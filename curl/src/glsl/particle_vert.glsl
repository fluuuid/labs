#pragma glslify: curl = require(glsl-curl-noise)

// varying vec2 vUv;
// varying vec3 vPosition;

uniform float time;
attribute float _index;

void main()
{
    float multiplier = -10.;

    vec3 curlP = curl(position + (time));
    // curlP.x = curlP.x * smoothstep(0., 200., curlP.z);
    curlP *= multiplier;

    // curlP.z = position.z;

    // curlP.y = abs(curlP.y);
    // curlP.y += 1. / _index;

    // vPosition = curlP;
    // vUv = uv;

    gl_PointSize = 1.;

    vec4 mvPosition = modelViewMatrix * vec4( curlP, 1.0 );
    gl_Position = projectionMatrix * mvPosition;
}