uniform float time;
// varying vec2 vUv;
varying float noise;

#pragma glslify: pnoise3 = require(glsl-noise/periodic/3d) 

float turbulence( vec3 p ) {
    float w = 100.0;
    float t = -.5;
    for (float f = 1.0 ; f <= 10.0 ; f++ ){
        float power = pow( 2.0, f );
        t += abs( pnoise3( vec3( power * p ), vec3( 10.0, 10.0, 10.0 ) ) / power );
    }
    return t;
}


// void main()
// {
//     vUv = uv;
//     noise = 10. * -.1 * turbulence( .5 * normal + time );
//     float b = 5.0 * pnoise3( 0.5 * 
//         vec3(position.xyz) 
//         + vec3(20.0 * time), vec3( 100.0 ) );

//     float displacement = - 10. * noise + b;
//     vec3 newPosition = position + normal * displacement;

//     gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
// }


varying vec3 vViewPosition;
varying vec3 vNormal;

float saturate( in float a ) { return clamp( a, 0.0, 1.0 ); }
vec2  saturate( in vec2 a )  { return clamp( a, 0.0, 1.0 ); }
vec3  saturate( in vec3 a )  { return clamp( a, 0.0, 1.0 ); }
vec4  saturate( in vec4 a )  { return clamp( a, 0.0, 1.0 ); }
// http://en.wikibooks.org/wiki/GLSL_Programming/Applying_Matrix_Transformations

vec3 inputToLinear( in vec3 a ) {
#ifdef GAMMA_INPUT
    return pow( a, vec3( float( GAMMA_FACTOR ) ) );
#else
    return a;
#endif
}
vec3 linearToOutput( in vec3 a ) {
#ifdef GAMMA_OUTPUT
    return pow( a, vec3( 1.0 / float( GAMMA_FACTOR ) ) );
#else
    return a;
#endif
}

#if MAX_SPOT_LIGHTS > 0 || defined( USE_BUMPMAP ) || defined( USE_ENVMAP )

    varying vec3 vWorldPosition;

#endif

#ifdef USE_COLOR

    varying vec3 vColor;

#endif

#ifdef USE_LOGDEPTHBUF

    #ifdef USE_LOGDEPTHBUF_EXT

        varying float vFragDepth;

    #endif

    uniform float logDepthBufFC;

#endif

void main() {
#ifdef USE_COLOR

    vColor.xyz = inputToLinear( color.xyz );

#endif

    vec3 objectNormal = normal;

#ifdef FLIP_SIDED

    objectNormal = -objectNormal;

#endif

vec3 transformedNormal = normalMatrix * objectNormal;

vNormal = normalize( transformedNormal );

vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );

vViewPosition = -mvPosition.xyz;

noise = 10. * -.1 * turbulence( .5 * normal + time );
float b = 5.0 * pnoise3( 0.5 * 
    vec3(position.xyz) 
    + vec3(20.0 * time), vec3( 100.0 ) );

float displacement = - 10. * noise + b;
vec3 newPosition = position + normal * displacement;

gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);

// vec4 worldPosition = modelMatrix * vec4( newPosition, 1.0 );
// gl_Position = worldPosition;
}