// uniform mat4 modelViewMatrix;
// uniform mat4 projectionMatrix;
// attribute vec3 position;

#pragma glslify: random = require(glsl-random/lowp)

attribute vec2 fboUV;

varying float vColor;
varying float vAlpha;

uniform sampler2D texturePosition;
uniform float opacity;
uniform float sizeBase;
uniform float sizeExtra;

void main() {
    vec3 pos = texture2D( texturePosition, fboUV ).xyz;

    float r = (1.0 - cos(smoothstep(500.0, 300.0, pos.x) * 3.141592654)) * 0.5;
    pos.yz *= r;

    pos.x = clamp(pos.x, -500.0, 500.0);

    vColor = random(fboUV + vec2(23.0, 31.22));

    gl_Position = projectionMatrix * viewMatrix  * vec4( pos, 1.0 );

    vAlpha = smoothstep(-500.0 + 200.0 * random(fboUV + 1.0), -200.0, pos.x) * clamp(1000.0 / gl_Position.z, 0.0, 1.0) * opacity;

    gl_PointSize = (sizeBase + random(fboUV) * sizeExtra) * (500.0 / gl_Position.z);

}
