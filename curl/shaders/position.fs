#pragma glslify: random = require(glsl-random/lowp)

uniform vec2 resolution;
uniform sampler2D textureVelocity;
uniform sampler2D texturePosition;

uniform float delta;

void main() {

    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec3 position = texture2D( texturePosition, uv ).xyz;
    vec3 velocity = texture2D( textureVelocity, uv ).xyz;

    position += velocity * delta * 2.5;

    float dist = abs(distance(position.xyz, vec3(0.)));
    if(dist > resolution.x / 3. || dist > resolution.y / 3. )
    {
        position.x = random(vec2(-50., 50.));
        position.y = random(vec2(-50., 50.));
        position.z = random(vec2(-50., 50.));
        // position.y = random(vec2(-.5, .5));
        // position.xyz = vec3(0.);
        // position.y = random(vec2(-.5, .5));
    }

    gl_FragColor = vec4( position, 1.0 );

}
