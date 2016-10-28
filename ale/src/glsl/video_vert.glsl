varying vec3 vPosition;
varying vec2 vUv;
varying vec3 vNormal;

void main()
{
  vPosition = position.xyz;
  vUv = uv;
  vNormal = normal;
  vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
  gl_Position = projectionMatrix * mvPosition;
}
