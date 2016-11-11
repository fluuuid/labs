#pragma glslify: snoise3 = require(glsl-noise/simplex/3d)
#pragma glslify: snoise2 = require(glsl-noise/simplex/2d)

#define PI 3.14159265359
#define TWO_PI 6.28318530718

uniform vec3 color;
uniform float uTime;
uniform sampler2D map;
uniform vec2 uResolution;
uniform float delta;
uniform float mod1;
uniform float mod2;
uniform float mod3;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

void main() {
  //

  // float t = sin(uTime);
  // vec2 p = vUv - vec2(0.5);
  //
  // float r = length(p);
  // float a = atan(p.y, p.x);
  //
  // // distort
  // r = sqrt(r); // pinch
  // //r = r*r; // bulge
  //
  // // polar to cartesian coordinates
  // p = r * vec2(cos(a), sin(a));

  float noise = snoise2(vUv + uTime * mod1);

  vec2 center = vec2(
    (0.5 + 0.5 * cos(TWO_PI * (uTime * mod1) * mod2 + vUv.s)),
    (0.5 + 0.5 * sin(TWO_PI * (uTime * mod1) * mod3 + vUv.t))
  );

  // center += noise * 0.01;
  vec2 dir = normalize( center - vUv );
  float d = length( center - vUv );
  float factor = (0.5 + 0.5 * sin(TWO_PI * 0.01));
  float f = pow( factor * ( d - .5 ), 0.99876 );
  // f *= f;
  // f = 0.0;
  // if( d > .5 ) f = 0.;
  // if( d > .5 ) f = 0.;

  vec3 texel1 = texture2D(map, vUv + f * dir).rgb;
  vec3 texel2 = texture2D(map, vUv).rgb;

  gl_FragColor.xyz = texel1;
  // gl_FragColor.xyz = texel1 + texel1 * noise;
  // gl_FragColor.xyz = mix(texel1, texel2, noise);
  // gl_FragColor.xyz = texel2 * (texel1 * texel2 * noise);

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
