#pragma glslify: curlNoise = require(glsl-curl-noise)
#pragma glslify: random = require(glsl-random/lowp)

uniform vec2 resolution;
uniform sampler2D texturePosition;
uniform float speed;

void main() {

    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec3 position = texture2D( texturePosition, uv ).xyz;

    vec3 velocity = curlNoise(position * .02) * 0.1;
    float r = random( vec2( .8 ) );

    float l = pow(smoothstep(resolution.x, -resolution.x,  position.x), r);
    // velocity *= -1.5 + l * - (2.2 + random(uv) * 2.2);
    // velocity.x = clamp(velocity.x, -5.0, -0.01);

    velocity *= speed * random(uv) * l;

    gl_FragColor = vec4( velocity, 1.0 );

}
