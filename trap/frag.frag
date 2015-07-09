#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#define PI 3.14159
#define PI2 6.28318
#define RECIPROCAL_PI2 0.15915494
#define LOG2 1.442695
#define EPSILON 1e-6

float square( in float a ) { return a*a; }
vec2  square( in vec2 a )  { return vec2( a.x*a.x, a.y*a.y ); }
vec3  square( in vec3 a )  { return vec3( a.x*a.x, a.y*a.y, a.z*a.z ); }
vec4  square( in vec4 a )  { return vec4( a.x*a.x, a.y*a.y, a.z*a.z, a.w*a.w ); }
float saturate( in float a ) { return clamp( a, 0.0, 1.0 ); }
vec2  saturate( in vec2 a )  { return clamp( a, 0.0, 1.0 ); }
vec3  saturate( in vec3 a )  { return clamp( a, 0.0, 1.0 ); }
vec4  saturate( in vec4 a )  { return clamp( a, 0.0, 1.0 ); }
float average( in float a ) { return a; }
float average( in vec2 a )  { return ( a.x + a.y) * 0.5; }
float average( in vec3 a )  { return ( a.x + a.y + a.z) / 3.0; }
float average( in vec4 a )  { return ( a.x + a.y + a.z + a.w) * 0.25; }
float whiteCompliment( in float a ) { return saturate( 1.0 - a ); }
vec2  whiteCompliment( in vec2 a )  { return saturate( vec2(1.0) - a ); }
vec3  whiteCompliment( in vec3 a )  { return saturate( vec3(1.0) - a ); }
vec4  whiteCompliment( in vec4 a )  { return saturate( vec4(1.0) - a ); }
vec3 transformDirection( in vec3 normal, in mat4 matrix ) {
    return normalize( ( matrix * vec4( normal, 0.0 ) ).xyz );
}
// http://en.wikibooks.org/wiki/GLSL_Programming/Applying_Matrix_Transformations
vec3 inverseTransformDirection( in vec3 normal, in mat4 matrix ) {
    return normalize( ( vec4( normal, 0.0 ) * matrix ).xyz );
}
vec3 projectOnPlane(in vec3 point, in vec3 pointOnPlane, in vec3 planeNormal) {
    float distance = dot( planeNormal, point-pointOnPlane );
    return point - distance * planeNormal;
}
float sideOfPlane( in vec3 point, in vec3 pointOnPlane, in vec3 planeNormal ) {
    return sign( dot( point - pointOnPlane, planeNormal ) );
}
vec3 linePlaneIntersect( in vec3 pointOnLine, in vec3 lineDirection, in vec3 pointOnPlane, in vec3 planeNormal ) {
    return pointOnLine + lineDirection * ( dot( planeNormal, pointOnPlane - pointOnLine ) / dot( planeNormal, lineDirection ) );
}
float calcLightAttenuation( float lightDistance, float cutoffDistance, float decayExponent ) {
    if ( decayExponent > 0.0 ) {
      return pow( saturate( 1.0 - lightDistance / cutoffDistance ), decayExponent );
    }
    return 1.0;
}

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

#ifdef USE_COLOR

    varying vec3 vColor;

#endif

// #if defined( USE_MAP ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( USE_SPECULARMAP ) || defined( USE_ALPHAMAP )

    varying vec2 vUv;

// #endif

// #ifdef USE_MAP

//     uniform sampler2D map;

// #endif
// #ifdef USE_ALPHAMAP

//     uniform sampler2D alphaMap;

// #endif

// #ifdef USE_LIGHTMAP

//     varying vec2 vUv2;
//     uniform sampler2D lightMap;

// #endif
// #ifdef USE_ENVMAP

//     uniform float reflectivity;
//     #ifdef ENVMAP_TYPE_CUBE
//         uniform samplerCube envMap;
//     #else
//         uniform sampler2D envMap;
//     #endif
//     uniform float flipEnvMap;

//     #if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG )

//         uniform float refractionRatio;

//     #else

//         varying vec3 vReflect;

//     #endif

// #endif

#ifdef USE_FOG

    uniform vec3 fogColor;

    #ifdef FOG_EXP2

        uniform float fogDensity;

    #else

        uniform float fogNear;
        uniform float fogFar;
    #endif

#endif
uniform vec3 ambientLightColor;

#if MAX_DIR_LIGHTS > 0

    uniform vec3 directionalLightColor[ MAX_DIR_LIGHTS ];
    uniform vec3 directionalLightDirection[ MAX_DIR_LIGHTS ];

#endif

#if MAX_HEMI_LIGHTS > 0

    uniform vec3 hemisphereLightSkyColor[ MAX_HEMI_LIGHTS ];
    uniform vec3 hemisphereLightGroundColor[ MAX_HEMI_LIGHTS ];
    uniform vec3 hemisphereLightDirection[ MAX_HEMI_LIGHTS ];

#endif

#if MAX_POINT_LIGHTS > 0

    uniform vec3 pointLightColor[ MAX_POINT_LIGHTS ];

    uniform vec3 pointLightPosition[ MAX_POINT_LIGHTS ];
    uniform float pointLightDistance[ MAX_POINT_LIGHTS ];
    uniform float pointLightDecay[ MAX_POINT_LIGHTS ];

#endif

#if MAX_SPOT_LIGHTS > 0

    uniform vec3 spotLightColor[ MAX_SPOT_LIGHTS ];
    uniform vec3 spotLightPosition[ MAX_SPOT_LIGHTS ];
    uniform vec3 spotLightDirection[ MAX_SPOT_LIGHTS ];
    uniform float spotLightAngleCos[ MAX_SPOT_LIGHTS ];
    uniform float spotLightExponent[ MAX_SPOT_LIGHTS ];
    uniform float spotLightDistance[ MAX_SPOT_LIGHTS ];
    uniform float spotLightDecay[ MAX_SPOT_LIGHTS ];

#endif

#if MAX_SPOT_LIGHTS > 0 || defined( USE_BUMPMAP ) || defined( USE_ENVMAP )

    varying vec3 vWorldPosition;

#endif

#ifdef WRAP_AROUND

    uniform vec3 wrapRGB;

#endif

varying vec3 vViewPosition;

// #ifndef FLAT_SHADED

    varying vec3 vNormal;

// #endif

#ifdef USE_LOGDEPTHBUF

    uniform float logDepthBufFC;

    #ifdef USE_LOGDEPTHBUF_EXT

        #extension GL_EXT_frag_depth : enable
        varying float vFragDepth;

    #endif

#endif
void main() {
    vec3 outgoingLight = vec3( 0.0 );
    vec4 diffuseColor = vec4( diffuse, opacity );
#if defined(USE_LOGDEPTHBUF) && defined(USE_LOGDEPTHBUF_EXT)

    gl_FragDepthEXT = log2(vFragDepth) * logDepthBufFC * 0.5;

#endif
#ifdef USE_COLOR

    diffuseColor.rgb *= vColor;

#endif

#ifdef ALPHATEST

    if ( diffuseColor.a < ALPHATEST ) discard;

#endif

float specularStrength;

    specularStrength = 1.0;


    vec3 normal = normalize( vNormal );

    #ifdef DOUBLE_SIDED

        normal = normal * ( -1.0 + 2.0 * float( gl_FrontFacing ) );

    #endif


vec3 viewPosition = normalize( vViewPosition );

vec3 totalDiffuseLight = vec3( 0.0 );
vec3 totalSpecularLight = vec3( 0.0 );

#if MAX_POINT_LIGHTS > 0

    for ( int i = 0; i < MAX_POINT_LIGHTS; i ++ ) {

        vec4 lPosition = viewMatrix * vec4( pointLightPosition[ i ], 1.0 );
        vec3 lVector = lPosition.xyz + vViewPosition.xyz;

        float attenuation = calcLightAttenuation( length( lVector ), pointLightDistance[ i ], pointLightDecay[ i ] );

        lVector = normalize( lVector );

        // diffuse

        float dotProduct = dot( normal, lVector );

        #ifdef WRAP_AROUND

            float pointDiffuseWeightFull = max( dotProduct, 0.0 );
            float pointDiffuseWeightHalf = max( 0.5 * dotProduct + 0.5, 0.0 );

            vec3 pointDiffuseWeight = mix( vec3( pointDiffuseWeightFull ), vec3( pointDiffuseWeightHalf ), wrapRGB );

        #else

            float pointDiffuseWeight = max( dotProduct, 0.0 );

        #endif

        totalDiffuseLight += pointLightColor[ i ] * pointDiffuseWeight * attenuation;

                // specular

        vec3 pointHalfVector = normalize( lVector + viewPosition );
        float pointDotNormalHalf = max( dot( normal, pointHalfVector ), 0.0 );
        float pointSpecularWeight = specularStrength * max( pow( pointDotNormalHalf, shininess ), 0.0 );

        float specularNormalization = ( shininess + 2.0 ) / 8.0;

        vec3 schlick = specular + vec3( 1.0 - specular ) * pow( max( 1.0 - dot( lVector, pointHalfVector ), 0.0 ), 5.0 );
        totalSpecularLight += schlick * pointLightColor[ i ] * pointSpecularWeight * pointDiffuseWeight * attenuation * specularNormalization;

    }

#endif

#if MAX_SPOT_LIGHTS > 0

    for ( int i = 0; i < MAX_SPOT_LIGHTS; i ++ ) {

        vec4 lPosition = viewMatrix * vec4( spotLightPosition[ i ], 1.0 );
        vec3 lVector = lPosition.xyz + vViewPosition.xyz;

        float attenuation = calcLightAttenuation( length( lVector ), spotLightDistance[ i ], spotLightDecay[ i ] );

        lVector = normalize( lVector );

        float spotEffect = dot( spotLightDirection[ i ], normalize( spotLightPosition[ i ] - vWorldPosition ) );

        if ( spotEffect > spotLightAngleCos[ i ] ) {

            spotEffect = max( pow( max( spotEffect, 0.0 ), spotLightExponent[ i ] ), 0.0 );

            // diffuse

            float dotProduct = dot( normal, lVector );

            #ifdef WRAP_AROUND

                float spotDiffuseWeightFull = max( dotProduct, 0.0 );
                float spotDiffuseWeightHalf = max( 0.5 * dotProduct + 0.5, 0.0 );

                vec3 spotDiffuseWeight = mix( vec3( spotDiffuseWeightFull ), vec3( spotDiffuseWeightHalf ), wrapRGB );

            #else

                float spotDiffuseWeight = max( dotProduct, 0.0 );

            #endif

            totalDiffuseLight += spotLightColor[ i ] * spotDiffuseWeight * attenuation * spotEffect;

            // specular

            vec3 spotHalfVector = normalize( lVector + viewPosition );
            float spotDotNormalHalf = max( dot( normal, spotHalfVector ), 0.0 );
            float spotSpecularWeight = specularStrength * max( pow( spotDotNormalHalf, shininess ), 0.0 );

            float specularNormalization = ( shininess + 2.0 ) / 8.0;

            vec3 schlick = specular + vec3( 1.0 - specular ) * pow( max( 1.0 - dot( lVector, spotHalfVector ), 0.0 ), 5.0 );
            totalSpecularLight += schlick * spotLightColor[ i ] * spotSpecularWeight * spotDiffuseWeight * attenuation * specularNormalization * spotEffect;

        }

    }

#endif

#if MAX_DIR_LIGHTS > 0

    for( int i = 0; i < MAX_DIR_LIGHTS; i ++ ) {

        vec3 dirVector = transformDirection( directionalLightDirection[ i ], viewMatrix );

        // diffuse

        float dotProduct = dot( normal, dirVector );

        #ifdef WRAP_AROUND

            float dirDiffuseWeightFull = max( dotProduct, 0.0 );
            float dirDiffuseWeightHalf = max( 0.5 * dotProduct + 0.5, 0.0 );

            vec3 dirDiffuseWeight = mix( vec3( dirDiffuseWeightFull ), vec3( dirDiffuseWeightHalf ), wrapRGB );

        #else

            float dirDiffuseWeight = max( dotProduct, 0.0 );

        #endif

        totalDiffuseLight += directionalLightColor[ i ] * dirDiffuseWeight;

        // specular

        vec3 dirHalfVector = normalize( dirVector + viewPosition );
        float dirDotNormalHalf = max( dot( normal, dirHalfVector ), 0.0 );
        float dirSpecularWeight = specularStrength * max( pow( dirDotNormalHalf, shininess ), 0.0 );

        /*
        // fresnel term from skin shader
        const float F0 = 0.128;

        float base = 1.0 - dot( viewPosition, dirHalfVector );
        float exponential = pow( base, 5.0 );

        float fresnel = exponential + F0 * ( 1.0 - exponential );
        */

        /*
        // fresnel term from fresnel shader
        const float mFresnelBias = 0.08;
        const float mFresnelScale = 0.3;
        const float mFresnelPower = 5.0;

        float fresnel = mFresnelBias + mFresnelScale * pow( 1.0 + dot( normalize( -viewPosition ), normal ), mFresnelPower );
        */

        float specularNormalization = ( shininess + 2.0 ) / 8.0;

        //      dirSpecular += specular * directionalLightColor[ i ] * dirSpecularWeight * dirDiffuseWeight * specularNormalization * fresnel;

        vec3 schlick = specular + vec3( 1.0 - specular ) * pow( max( 1.0 - dot( dirVector, dirHalfVector ), 0.0 ), 5.0 );
        totalSpecularLight += schlick * directionalLightColor[ i ] * dirSpecularWeight * dirDiffuseWeight * specularNormalization;


    }

#endif

#if MAX_HEMI_LIGHTS > 0

    for( int i = 0; i < MAX_HEMI_LIGHTS; i ++ ) {

        vec3 lVector = transformDirection( hemisphereLightDirection[ i ], viewMatrix );

        // diffuse

        float dotProduct = dot( normal, lVector );
        float hemiDiffuseWeight = 0.5 * dotProduct + 0.5;

        vec3 hemiColor = mix( hemisphereLightGroundColor[ i ], hemisphereLightSkyColor[ i ], hemiDiffuseWeight );

        totalDiffuseLight += hemiColor;

        // specular (sky light)

        vec3 hemiHalfVectorSky = normalize( lVector + viewPosition );
        float hemiDotNormalHalfSky = 0.5 * dot( normal, hemiHalfVectorSky ) + 0.5;
        float hemiSpecularWeightSky = specularStrength * max( pow( max( hemiDotNormalHalfSky, 0.0 ), shininess ), 0.0 );

        // specular (ground light)

        vec3 lVectorGround = -lVector;

        vec3 hemiHalfVectorGround = normalize( lVectorGround + viewPosition );
        float hemiDotNormalHalfGround = 0.5 * dot( normal, hemiHalfVectorGround ) + 0.5;
        float hemiSpecularWeightGround = specularStrength * max( pow( max( hemiDotNormalHalfGround, 0.0 ), shininess ), 0.0 );

        float dotProductGround = dot( normal, lVectorGround );

        float specularNormalization = ( shininess + 2.0 ) / 8.0;

        vec3 schlickSky = specular + vec3( 1.0 - specular ) * pow( max( 1.0 - dot( lVector, hemiHalfVectorSky ), 0.0 ), 5.0 );
        vec3 schlickGround = specular + vec3( 1.0 - specular ) * pow( max( 1.0 - dot( lVectorGround, hemiHalfVectorGround ), 0.0 ), 5.0 );
        totalSpecularLight += hemiColor * specularNormalization * ( schlickSky * hemiSpecularWeightSky * max( dotProduct, 0.0 ) + schlickGround * hemiSpecularWeightGround * max( dotProductGround, 0.0 ) );

    }

#endif

#ifdef METAL

    outgoingLight += diffuseColor.rgb * ( totalDiffuseLight + ambientLightColor ) * specular + totalSpecularLight + emissive;

#else

    outgoingLight += diffuseColor.rgb * ( totalDiffuseLight + ambientLightColor ) + totalSpecularLight + emissive;

#endif



    outgoingLight = linearToOutput( outgoingLight );

#ifdef USE_FOG

    #ifdef USE_LOGDEPTHBUF_EXT

        float depth = gl_FragDepthEXT / gl_FragCoord.w;

    #else

        float depth = gl_FragCoord.z / gl_FragCoord.w;

    #endif

    #ifdef FOG_EXP2

        float fogFactor = exp2( - square( fogDensity ) * square( depth ) * LOG2 );
        fogFactor = whiteCompliment( fogFactor );

    #else

        float fogFactor = smoothstep( fogNear, fogFar, depth );

    #endif
    
    outgoingLight = mix( outgoingLight, fogColor, fogFactor );

#endif
    gl_FragColor = vec4( outgoingLight, diffuseColor.a );
}