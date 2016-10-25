#pragma glslify: snoise2 = require(glsl-noise/simplex/2d)

#define PI 3.14159265359

uniform vec3 color;
uniform float uTime;
uniform sampler2D map;
uniform vec2 uResolution;
uniform vec2 uMouse;

const float radius = .5;
const float depth = radius/2.;

const float wave_amp = 0.13;
const float wave_freq = 2.0;
const float wave_speed = .5;

void main() {
  vec2 fragCoord = gl_FragCoord.xy / uResolution;

  float d = -fragCoord.x + 0.3 * fragCoord.y + texture2D(map,fragCoord).x * 0.03 - exp(-1.0 + fragCoord.x) +  exp(-fragCoord.y);
  float a = mod(wave_speed * uTime + d * wave_freq, 4.0 * PI);

  // vec2 center = vec2(snoise2(fragCoord * a));
  vec2 center = uMouse / uResolution;
  // center.y -= -.5;

  fragCoord.x += cos(a) * wave_amp;
  fragCoord.y += sin(a) * wave_amp;

  float ax = ((fragCoord.x - center.x) * (fragCoord.x - center.x)) / (0.2*0.2) + ((fragCoord.y - center.y) * (fragCoord.y - center.y)) / (0.2/ (  uResolution.x / uResolution.y )) ;
	float dx = 0.0 + (-depth/radius)*ax + (depth/(radius*radius))*ax*ax;
  float f =  (ax + dx );
	if (ax > radius) f = ax;
  vec2 magnifierArea = center + (fragCoord-center)*f/ax;

  vec4 texel = texture2D(map, magnifierArea);
  float shadow = .75 - 0.25*(sin(a-0.3));
  gl_FragColor = texel * shadow;
}
