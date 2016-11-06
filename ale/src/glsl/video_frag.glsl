#pragma glslify: snoise3 = require(glsl-noise/simplex/3d)
#pragma glslify: snoise2 = require(glsl-noise/simplex/2d)

#define PI 3.14159265359

uniform vec3 color;
uniform float uTime;
uniform sampler2D map;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform float delta;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float noise = snoise2(uv);

  vec2 duv = uv;
  duv.s = uv.t + cos(noise);
  duv.t = uv.s * sin(noise);

  duv = smoothstep(duv, uv, vec2(noise));

  vec3 texelDistorted = texture2D(map, duv).xyz;
  vec3 texel = texture2D(map, uv).xyz;

  vec3 col = texelDistorted * texel;

  gl_FragColor = vec4(col, 1.0);
}

/*

void main() {

  vec3 animatedTopColor = mix(color0, color1, snoise_3d(vPosition * vec3(0.0025) + vec3(time * 0.1)));

  float h = normalize( vWorldPosition + offset ).y;

  float a = max( pow( max( h , 0.0), exponent ), h);
  vec3 bottom = smoothstep(animatedTopColor, color0, vec3(a));

  // vec3 final = mix( color0, bottom, max( pow( max( h , 0.0), exponent ), 0.0 ) );

  // vec3 final = mix(firstColor, animatedTopColor, snoise_3d(vPosition * vec3(0.0025) + vec3(time * 0.1)));
  // vec3 final = firstColor * animatedTopColor;

  gl_FragColor = vec4(bottom, 1.0);
}

 */
